import test from 'ava';
import openg from '../src/index';

test('invalid arg', t => {
  t.throws(openg('thispackagedoesnotexist123abc'), Error);
});

test('string arg', async t => {
  await openg('openg', {
    dryRun: true
  }).then(resp => {
    t.deepEqual(resp, ['https://github.com/dawsonbotsford/openg/blob/master/packages/openg/readme.md']);
  });
  await openg('openg', {
    issues: true,
    dryRun: true
  }).then(resp => {
    t.deepEqual(resp, ['https://github.com/dawsonbotsford/openg/issues']);
  });
});

test('array arg', async t => {
  await openg(['a', 'arrford'], {
    dryRun: true
  }).then(resp => {
    t.deepEqual(resp, ['https://github.com/alfateam/a#readme', 'https://github.com/dawsonbotsford/arrford#readme']);
  });
  await openg(['a', 'arrford'], {
    issues: true,
    dryRun: true
  }).then(resp => {
    t.deepEqual(resp, ['https://github.com/alfateam/a/issues', 'https://github.com/dawsonbotsford/arrford/issues']);
  });
});
