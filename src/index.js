'use strict';
require("babel-register")({
  ignore: false
});
const opn = require('opn');
const shelljs = require('shelljs');
const npmName = require('npm-name');
const packageJson = require('package-json');
require('babel-polyfill');

module.exports = function () {
  let packages = Array.prototype.slice.call(arguments);
  if (packages.length === 0) {
    // if it's a git repo
    const revParse = shelljs.exec('git rev-parse --show-toplevel', {silent: true});
    if (revParse.code === 0) {
      const splitRevParse = revParse.stdout.split('/');
      packages = [splitRevParse[splitRevParse.length - 1].trim()];
    } else {
      throw new Error('Specify one or more npmjs arguments, none found');
    }
  }

  return Promise.all(packages.map(myPackage => {
  // return packages.map(myPackage => {
    myPackage = myPackage.toLowerCase();
    return npmName(myPackage)
      .then(available => {
        // return available;
        if (available) {
          throw new Error(`package ${myPackage} not found`);
        } else {
          packageJson(myPackage, 'latest').then(json => {
            if (json.homepage) {
              opn(json.homepage, {wait: false});
              return myPackage;
            }
            throw new Error(`homepage not found in package.json of module "${myPackage}"`);
          });
        }
      }).catch(err => {
        throw err;
      });
  }));
};
