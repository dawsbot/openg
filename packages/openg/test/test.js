// The module under test is required last on purpose, after the `open` stub is
// installed in the require cache — so import grouping cannot apply here.
/* eslint-disable import/order */
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const process = require('node:process');
const {execFileSync} = require('node:child_process');
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

const originalCwd = process.cwd();
const temporaryRepos = [];

// A throwaway git repo, optionally with a package.json and a remote
function makeRepo({manifest, remote} = {}) {
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'openg-test-'));
  temporaryRepos.push(directory);

  const run = arguments_ => execFileSync('git', arguments_, {cwd: directory, stdio: 'ignore'});
  run(['init']);

  if (remote) {
    run(['remote', 'add', 'origin', remote]);
  }

  if (manifest) {
    fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify(manifest));
  }

  return directory;
}

test.before(() => {
  nock.disableNetConnect();
});

test.after.always(() => {
  for (const directory of temporaryRepos) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

test.beforeEach(() => {
  opened.length = 0;
  nock.cleanAll();
});

test.afterEach.always(() => {
  process.chdir(originalCwd);
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

test.serial('rejects when there is no homepage and no repository', async t => {
  mockPackage('alpha', {});

  const error = await t.throwsAsync(openg('alpha', {dryRun: true}));

  t.regex(error.message, /no "homepage" field/);
});

test.serial('rejects when the issues option finds no bugs and no repository', async t => {
  mockPackage('alpha', {homepage: 'https://github.com/acme/alpha#readme'});

  const error = await t.throwsAsync(openg('alpha', {issues: true, dryRun: true}));

  t.regex(error.message, /no "bugs" field/);
});

// Falling back to `repository` when `homepage` / `bugs` are missing

const REPOSITORY_SHAPES = [
  ['object with git+https url', {type: 'git', url: 'git+https://github.com/acme/alpha.git'}],
  ['object with git:// url', {type: 'git', url: 'git://github.com/acme/alpha.git'}],
  ['object with ssh url', {type: 'git', url: 'git+ssh://git@github.com/acme/alpha.git'}],
  ['object with scp-style url', {type: 'git', url: 'git@github.com:acme/alpha.git'}],
  ['object with plain https url', {type: 'git', url: 'https://github.com/acme/alpha'}],
  ['bare url string', 'https://github.com/acme/alpha'],
  ['github shorthand string', 'acme/alpha'],
];

for (const [label, repository] of REPOSITORY_SHAPES) {
  test.serial(`infers the homepage from a repository given as a ${label}`, async t => {
    mockPackage('alpha', {repository});

    const urls = await openg('alpha', {dryRun: true});

    t.deepEqual(urls, ['https://github.com/acme/alpha']);
  });

  test.serial(`infers the issues page from a repository given as a ${label}`, async t => {
    mockPackage('alpha', {repository});

    const urls = await openg('alpha', {issues: true, dryRun: true});

    t.deepEqual(urls, ['https://github.com/acme/alpha/issues']);
  });
}

test.serial('points at the subdirectory for a monorepo package', async t => {
  mockPackage('alpha', {
    repository: {
      type: 'git',
      url: 'https://github.com/acme/monorepo.git',
      directory: 'packages/alpha',
    },
  });

  const urls = await openg('alpha', {dryRun: true});

  // `HEAD` rather than a hardcoded branch, so it works whatever the repo's default branch is
  t.deepEqual(urls, ['https://github.com/acme/monorepo/tree/HEAD/packages/alpha']);
});

test.serial('prefers an explicit homepage over the repository', async t => {
  mockPackage('alpha', {
    homepage: 'https://alpha.example.com',
    repository: {type: 'git', url: 'git+https://github.com/acme/alpha.git'},
  });

  const urls = await openg('alpha', {dryRun: true});

  t.deepEqual(urls, ['https://alpha.example.com']);
});

test.serial('prefers an explicit bugs url over the repository', async t => {
  mockPackage('alpha', {
    bugs: {url: 'https://issues.example.com/alpha'},
    repository: {type: 'git', url: 'git+https://github.com/acme/alpha.git'},
  });

  const urls = await openg('alpha', {issues: true, dryRun: true});

  t.deepEqual(urls, ['https://issues.example.com/alpha']);
});

test.serial('accepts a bugs field given as a bare string', async t => {
  mockPackage('alpha', {bugs: 'https://issues.example.com/alpha'});

  const urls = await openg('alpha', {issues: true, dryRun: true});

  t.deepEqual(urls, ['https://issues.example.com/alpha']);
});

test.serial('infers from non-github hosts too', async t => {
  mockPackage('alpha', {repository: {type: 'git', url: 'git+https://gitlab.com/acme/alpha.git'}});

  const urls = await openg('alpha', {dryRun: true});

  t.deepEqual(urls, ['https://gitlab.com/acme/alpha']);
});

test.serial('rejects when the repository host is not recognised', async t => {
  mockPackage('alpha', {repository: {type: 'git', url: 'https://git.example.com/acme/alpha.git'}});

  const error = await t.throwsAsync(openg('alpha', {dryRun: true}));

  t.regex(error.message, /no "homepage" field/);
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

// Resolving the repo we're standing in, when no module name is given

test.serial('with no arguments, falls back to the git remote when there is no package.json', async t => {
  process.chdir(makeRepo({remote: 'git@github.com:acme/widgets.git'}));

  const urls = await openg([], {dryRun: true});

  t.deepEqual(urls, ['https://github.com/acme/widgets']);
});

test.serial('with no arguments and --issues, derives the issues page from the git remote', async t => {
  process.chdir(makeRepo({remote: 'git@github.com:acme/widgets.git'}));

  const urls = await openg([], {issues: true, dryRun: true});

  t.deepEqual(urls, ['https://github.com/acme/widgets/issues']);
});

test.serial('with no arguments, works from a subdirectory of the repo', async t => {
  const repo = makeRepo({remote: 'https://github.com/acme/widgets.git'});
  const nested = path.join(repo, 'src', 'deep');
  fs.mkdirSync(nested, {recursive: true});
  process.chdir(nested);

  const urls = await openg([], {dryRun: true});

  t.deepEqual(urls, ['https://github.com/acme/widgets']);
});

test.serial('with no arguments, prefers the local package.json homepage', async t => {
  process.chdir(makeRepo({
    remote: 'git@github.com:acme/widgets.git',
    manifest: {name: 'widgets', homepage: 'https://widgets.example.com'},
  }));

  const urls = await openg([], {dryRun: true});

  t.deepEqual(urls, ['https://widgets.example.com']);
});

test.serial('with no arguments, infers from the local package.json repository field', async t => {
  process.chdir(makeRepo({
    manifest: {name: 'widgets', repository: {type: 'git', url: 'git+https://github.com/acme/widgets.git'}},
  }));

  const urls = await openg([], {dryRun: true});

  t.deepEqual(urls, ['https://github.com/acme/widgets']);
});

test.serial('with no arguments, never touches the registry for an unpublished repo', async t => {
  // Net connections are disabled, so any registry call would throw here
  process.chdir(makeRepo({remote: 'git@github.com:acme/never-published.git'}));

  const urls = await openg([], {dryRun: true});

  t.deepEqual(urls, ['https://github.com/acme/never-published']);
});

test.serial('with no arguments, rejects outside a git repo', async t => {
  const notARepo = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'openg-plain-'));
  temporaryRepos.push(notARepo);
  process.chdir(notARepo);

  const error = await t.throwsAsync(openg([], {dryRun: true}));

  t.regex(error.message, /Specify one or more npm module names/);
});
