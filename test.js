import test from 'ava';
const openg = require('./index');

test('invalid arg', t => {
  t.throws(openg('thispackagedoesnotexist123abc'), Error);
});

test('valid arg', async () => {
  await openg('a', 'b');
});
