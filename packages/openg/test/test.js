// The module under test is required last on purpose, after the `open` stub is
// installed in the require cache — so import grouping cannot apply here.
/* eslint-disable import/order */
'use strict';
const test = require('ava');
const nock = require('nock');

// Swap out `open` before the module under test grabs its reference, so tests
// never launch a real browser and can assert on what would have been opened
const openPath = require.resolve('open');
const opened = [];
require.cache[openPath] = {
  id: openPath,
  filename: openPath,
  loaded: true,
  async exports(url) {
    opened.push(url);
  },
};

const openg = require('../src/index.js');

const REGISTRY = 'https://registry.npmjs.org';

// A minimal but realistically shaped packument
function packument(name, manifest) {
  return {
    name,
    'dist-tags': {latest: '1.0.0'},
    versions: {
      '1.0.0': {name, version: '1.0.0', ...manifest},
    },
  };
}

function mockPackage(name, manifest) {
  nock(REGISTRY)
    .get(`/${encodeURIComponent(name).replace(/^%40/, '@')}`)
    .reply(200, packument(name, manifest));
}

function mockMissing(name) {
  nock(REGISTRY)
    .get(`/${encodeURIComponent(name).replace(/^%40/, '@')}`)
    .reply(404, {error: 'Not found'});
}

test.before(() => {
  nock.disableNetConnect();
});

test.beforeEach(() => {
  opened.length = 0;
  nock.cleanAll();
});

test.serial('resolves the homepage', async t => {
  mockPackage('alpha', {homepage: 'https://github.com/acme/alpha#readme'});

  const urls = await openg('alpha', {dryRun: true});

  t.deepEqual(urls, ['https://github.com/acme/alpha#readme']);
});

test.serial('resolves the issues page with the issues option', async t => {
  mockPackage('alpha', {
    homepage: 'https://github.com/acme/alpha#readme',
    bugs: {url: 'https://github.com/acme/alpha/issues'},
  });

  const urls = await openg('alpha', {issues: true, dryRun: true});

  t.deepEqual(urls, ['https://github.com/acme/alpha/issues']);
});

test.serial('accepts an array of module names', async t => {
  mockPackage('alpha', {homepage: 'https://github.com/acme/alpha#readme'});
  mockPackage('beta', {homepage: 'https://github.com/acme/beta#readme'});

  const urls = await openg(['alpha', 'beta'], {dryRun: true});

  t.deepEqual(urls, [
    'https://github.com/acme/alpha#readme',
    'https://github.com/acme/beta#readme',
  ]);
});

test.serial('lowercases module names', async t => {
  mockPackage('alpha', {homepage: 'https://github.com/acme/alpha#readme'});

  const urls = await openg('ALPHA', {dryRun: true});

  t.deepEqual(urls, ['https://github.com/acme/alpha#readme']);
});

test.serial('supports scoped modules', async t => {
  mockPackage('@acme/alpha', {homepage: 'https://github.com/acme/alpha#readme'});

  const urls = await openg('@acme/alpha', {dryRun: true});

  t.deepEqual(urls, ['https://github.com/acme/alpha#readme']);
});

test.serial('opens the url when dryRun is not set', async t => {
  mockPackage('alpha', {homepage: 'https://github.com/acme/alpha#readme'});

  await openg('alpha');

  t.deepEqual(opened, ['https://github.com/acme/alpha#readme']);
});

test.serial('works without an options argument', async t => {
  mockPackage('alpha', {homepage: 'https://github.com/acme/alpha#readme'});

  await t.notThrowsAsync(openg('alpha'));
});

test.serial('does not open anything on a dry run', async t => {
  mockPackage('alpha', {homepage: 'https://github.com/acme/alpha#readme'});

  await openg('alpha', {dryRun: true});

  t.deepEqual(opened, []);
});

test.serial('rejects when the module does not exist', async t => {
  mockMissing('nonexistent');

  const error = await t.throwsAsync(openg('nonexistent', {dryRun: true}));

  t.regex(error.message, /could not be found/);
});

test.serial('rejects when there is no homepage field', async t => {
  mockPackage('alpha', {});

  const error = await t.throwsAsync(openg('alpha', {dryRun: true}));

  t.regex(error.message, /no "homepage" field/);
});

test.serial('rejects when the issues option finds no bugs field', async t => {
  mockPackage('alpha', {homepage: 'https://github.com/acme/alpha#readme'});

  const error = await t.throwsAsync(openg('alpha', {issues: true, dryRun: true}));

  t.regex(error.message, /no "bugs" field/);
});

test.serial('still opens the valid modules when one of them fails', async t => {
  mockPackage('alpha', {homepage: 'https://github.com/acme/alpha#readme'});
  mockMissing('nonexistent');
  mockPackage('beta', {homepage: 'https://github.com/acme/beta#readme'});

  const error = await t.throwsAsync(openg(['alpha', 'nonexistent', 'beta']));

  t.true(error instanceof AggregateError);
  t.is(error.errors.length, 1);
  t.deepEqual(opened, [
    'https://github.com/acme/alpha#readme',
    'https://github.com/acme/beta#readme',
  ]);
});

test.serial('reports every failure when several modules fail', async t => {
  mockMissing('nope-one');
  mockMissing('nope-two');

  const error = await t.throwsAsync(openg(['nope-one', 'nope-two'], {dryRun: true}));

  t.is(error.errors.length, 2);
  t.regex(error.message, /2 of 2 modules/);
});
