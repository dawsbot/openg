// eslint import/no-extraneous-dependencies:0
'use strict';
const {execSync} = require('child_process');
const open = require('open');
const npmName = require('npm-name');
const packageJson = require('package-json');
const arrify = require('arrify');

module.exports = function (input, opts) {
  let packages = arrify(input);
  if (packages.length === 0) {
    let topLevel;
    try {
      topLevel = execSync('git rev-parse --show-toplevel', {stdio: ['ignore', 'pipe', 'ignore']}).toString();
    } catch (err) {
      throw new Error('Specify one or more npmjs arguments, none found');
    }
    const splitRevParse = topLevel.split('/');
    packages = [splitRevParse[splitRevParse.length - 1].trim()];
  }

  return Promise.all(packages.map(myPackage => {
    myPackage = myPackage.toLowerCase();
    return npmName(myPackage)
      .then(available => {
        // return available;
        if (available) {
          throw new Error(`package ${myPackage} not found`);
        } else {
          return packageJson(myPackage, 'latest').then(json => {
            // if issues flag passed in
            if (opts && opts.issues) {
              if (json && json.bugs && json.bugs.url) {
                if (opts.verbose) {
                  console.log(json.bugs.url);
                }
                if (!opts.dryRun) {
                  open(json.bugs.url);
                }
                return json.bugs.url;
              }
              throw new Error(`issue flag identified, but no "bugs" attribute found in package.json of ${myPackage}`);
            }
            // no issues flags passed in
            if (json.homepage) {
              if (opts.verbose) {
                console.log(json.homepage);
              }
              if (!opts.dryRun) {
                open(json.homepage);
              }
              return json.homepage;
            }
            throw new Error(`homepage not found in package.json of module "${myPackage}"`);
          });
        }
      }).catch(err => {
        throw err;
      });
  }));
};
