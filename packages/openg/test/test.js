/* eslint ava/no-ignored-test-files:0 */
import test from 'ava';
import openg from '../src/index';

test('invalid arg', t => {
  t.throws(openg('thispackagedoesnotexist123abc'), Error);
});

test('valid arg', async t => {
  await t.truthy(openg(['a', 'b']));
});
