import test from 'ava';
const cliLocation = '../cli.js';
const sh = require('shelljs');

test('cli - valid and invalid args', t => {
  t.true(sh.exec(cliLocation, {silent: true}).code === 0);
  t.true(sh.exec(cliLocation + ' package1', {silent: true, wait: false}).code === 0);
  t.true(sh.exec(cliLocation + ' package1 package2', {silent: true}).code === 0);
  t.true(sh.exec(cliLocation + ' thispackagenameisnotarealname0981234', {silent: true}).code === 1);
});
