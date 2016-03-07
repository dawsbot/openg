import test from 'ava';
const openm = require('./index.js');
const sh = require('shelljs');

test('package - valid args', t => {
  t.throws(() => {
    openm();
  }, Error);
  t.throws(() => {
    openm(false);
  }, TypeError);
});

test('package - basic url building', t => {
  t.is(openm('test-package'), 'https://npmjs.com/package/test-package');
  t.is(openm('test_package'), 'https://npmjs.com/package/test_package');
});

test('cli - valid and invalid args', t => {
  t.true(sh.exec('./cli.js', {silent: true}).code === 0);
  t.true(sh.exec('./cli.js openm', {silent: true, wait: false}).code === 0);
  t.true(sh.exec('./cli.js package1 package2', {silent: true}).code === 1);
});

