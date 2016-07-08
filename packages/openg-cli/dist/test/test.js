'use strict';

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cliLocation = '../cli.js'; /* eslint ava/no-ignored-test-files:0 */

var sh = require('shelljs');

(0, _ava2.default)('cli - valid and invalid args', function (t) {
  t.true(sh.exec(cliLocation).code === 0);
  t.true(sh.exec(cliLocation + ' inf', { silent: true, wait: false }).code === 0);
  t.true(sh.exec(cliLocation + ' Inf', { silent: true, wait: false }).code === 0);
  t.true(sh.exec(cliLocation + ' inf openm', { silent: true }).code === 0);
  t.true(sh.exec(cliLocation + ' thispackagenameisnotarealname0981234', { silent: true }).code === 1);
});