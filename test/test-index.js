import test from 'ava';
const openm = require('../index.js');

test('package - valid args', t => {
  t.throws(() => {
    openm();
  }, Error);
  t.throws(() => {
    openm(false);
  }, TypeError);
});

test('package - basic url building', t => {
  t.is(openm('test-package'), 'https://www.npmjs.com/package/test-package');
  t.is(openm('test_package'), 'https://www.npmjs.com/package/test_package');
});
