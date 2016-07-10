import test from 'ava';

const cliLocation = '../src/cli.js';
const sh = require('shelljs');

test('cli - valid and invalid args', t => {
  t.true(sh.exec(cliLocation).code === 0);
  t.true(sh.exec(`${cliLocation} inf`, {silent: true, wait: false}).code === 0);
  t.true(sh.exec(`${cliLocation} Inf`, {silent: true, wait: false}).code === 0);
  t.true(sh.exec(`${cliLocation} inf openm`, {silent: true}).code === 0);
  t.true(sh.exec(`${cliLocation} thispackagenameisnotarealname0981234`, {silent: true}).code === 1);
});
