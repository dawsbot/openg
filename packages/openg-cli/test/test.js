import test from 'ava';

const cliLocation = '../src/cli.js';
const shelljs = require('shelljs');

test('cli - invalid args', t => {
  t.true(shelljs.exec(`${cliLocation} thispackagenameisnotarealname0981234 --dryRun`, {silent: true}).code === 1);
});

test('cli - valid args', t => {
  t.true(shelljs.exec(`${cliLocation} --dryRun`).code === 0);
  t.true(shelljs.exec(`${cliLocation} inf --dryRun`, {silent: true, wait: false}).code === 0);
  t.true(shelljs.exec(`${cliLocation} Inf --dryRun`, {silent: true, wait: false}).code === 0);
  t.true(shelljs.exec(`${cliLocation} inf openm --dryRun`, {silent: true}).code === 0);
});
