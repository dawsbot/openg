#!/usr/bin/env node
'use strict';
const meow = require('meow');
const updateNotifier = require('update-notifier');
const opn = require('opn');
const sh = require('shelljs');
const npmName = require('npm-name');
const chalk = require('chalk');
const packageJson = require('package-json');

const cli = meow([
  'Usage',
  '  $ openg',
  '',
  '  $ openg <module name>',
  '',
  'Examples',
  '$ openg',
  '//=> opens the github repo page for the current directory in browser',
  '',
  '$ openg express',
  '//=> opens the github repo page for express in browser',
  '',
  '$ openg inf sist openg',
  '//=>  opens the github repo pages for inf, sist, and openg in browser'
]);

updateNotifier({pkg: cli.pkg}).notify();

let packages = cli.input;

const throwErr = (errMsg) => {
  console.error(chalk.red(errMsg));
  console.log(cli.help);
  process.exit(1);
};

if (packages.length === 0) {
  const revParse = sh.exec('git rev-parse --show-toplevel', {silent: true});
  // if it's a git repo
  if (revParse.code === 0) {
    const splitRevParse = revParse.stdout.split('/');
    packages = [splitRevParse[splitRevParse.length - 1].trim()];
  } else {
    throwErr('Specify one or more npmjs packages, none found');
  }
}

packages.forEach((myPackage) => {
  npmName(myPackage).then(available => {
    if (available === false) {
      packageJson(myPackage, 'latest').then(json => {
        if (json.homepage) {
          opn(json.homepage, {wait: false});
        } else {
          throwErr(`homepage not found in package.json of module "${myPackage}"`);
        }
      });
    } else {
      throwErr(`package ${myPackage} not found`);
    }
  });
});
