'use strict';
module.exports = function (packageName) {
  const argLength = arguments.length;

  // validate arguments
  if (typeof packageName !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof packageName}`);
  }
  if (argLength !== 1) {
    throw new Error(`Expected 1 arguments, got ${argLength}`);
  }

  return `https://www.npmjs.com/package/${packageName}`;
};
