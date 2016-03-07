import test from 'ava';
const openm = require('./index.js');

test('valid args', t => {
  t.throws(() => {
    openm();
  }, Error);
  t.throws(() => {
    openm(false);
  }, TypeError);
});

test('basic url building', t => {
  t.is(openm('test-package'), 'https://npmjs.com/package/test-package');
  t.is(openm('test_package'), 'https://npmjs.com/package/test_package');
});
