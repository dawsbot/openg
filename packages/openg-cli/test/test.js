import http from 'node:http';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {execa} from 'execa';

const CLI = fileURLToPath(new URL('../src/cli.js', import.meta.url));

// Packages served by the throwaway registry the CLI is pointed at
const PACKAGES = {
  alpha: {homepage: 'https://github.com/acme/alpha#readme', bugs: {url: 'https://github.com/acme/alpha/issues'}},
  beta: {homepage: 'https://github.com/acme/beta#readme'},
};

let server;
let registryUrl;

test.before(async () => {
  server = http.createServer((request, response) => {
    const name = decodeURIComponent(request.url.replace(/^\//, ''));
    const manifest = PACKAGES[name];

    if (!manifest) {
      response.writeHead(404, {'content-type': 'application/json'});
      response.end(JSON.stringify({error: 'Not found'}));
      return;
    }

    response.writeHead(200, {'content-type': 'application/json'});
    response.end(JSON.stringify({
      name,
      'dist-tags': {latest: '1.0.0'},
      versions: {'1.0.0': {name, version: '1.0.0', ...manifest}},
    }));
  });

  await new Promise(resolve => {
    server.listen(0, '127.0.0.1', resolve);
  });
  registryUrl = `http://127.0.0.1:${server.address().port}/`;
});

test.after.always(async () => {
  await new Promise(resolve => {
    server.close(resolve);
  });
});

const run = arguments_ => execa(process.execPath, [CLI, ...arguments_], {
  reject: false,
  env: {
    // eslint-disable-next-line camelcase -- the name npm itself reads
    npm_config_registry: registryUrl,
    NO_UPDATE_NOTIFIER: '1',
  },
});

test('prints the resolved url on a dry run', async t => {
  const {exitCode, stdout} = await run(['alpha', '--dryRun']);

  t.is(exitCode, 0);
  t.is(stdout.trim(), 'https://github.com/acme/alpha#readme');
});

test('prints the issues url with --issues', async t => {
  const {exitCode, stdout} = await run(['alpha', '--issues', '--dryRun']);

  t.is(exitCode, 0);
  t.is(stdout.trim(), 'https://github.com/acme/alpha/issues');
});

test('accepts the short flags', async t => {
  const {exitCode, stdout} = await run(['alpha', '-i', '-d']);

  t.is(exitCode, 0);
  t.is(stdout.trim(), 'https://github.com/acme/alpha/issues');
});

test('accepts kebab-case flags', async t => {
  const {exitCode, stdout} = await run(['alpha', '--dry-run']);

  t.is(exitCode, 0);
  t.is(stdout.trim(), 'https://github.com/acme/alpha#readme');
});

test('handles several modules at once', async t => {
  const {exitCode, stdout} = await run(['alpha', 'beta', '--dryRun']);

  t.is(exitCode, 0);
  t.deepEqual(stdout.trim().split('\n').sort(), [
    'https://github.com/acme/alpha#readme',
    'https://github.com/acme/beta#readme',
  ]);
});

test('exits 1 with a readable message for an unknown module', async t => {
  const {exitCode, stderr} = await run(['nonexistent', '--dryRun']);

  t.is(exitCode, 1);
  t.regex(stderr, /could not be found/);
  t.notRegex(stderr, /at .*cli\.js/); // No raw stack trace
});

test('still resolves the valid modules when one fails', async t => {
  const {exitCode, stdout, stderr} = await run(['alpha', 'nonexistent', '--dryRun']);

  t.is(exitCode, 1);
  t.regex(stdout, /alpha#readme/);
  t.regex(stderr, /could not be found/);
});

test('does not emit node warnings', async t => {
  const {stderr} = await run(['alpha', '--dryRun']);

  t.is(stderr.trim(), '');
});

test('--help exits successfully', async t => {
  const {exitCode, stdout} = await run(['--help']);

  t.is(exitCode, 0);
  t.regex(stdout, /--issues/);
  t.regex(stdout, /--verbose/);
});
