import test from 'ava';
const openg = require('../dist/index.js');

test('invalid arg', t => {
  t.throws(openg('thispackagedoesnotexist123abc'), Error);
});

test('valid arg', async () => {
  await openg('a', 'b');
});
