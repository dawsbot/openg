#!/usr/bin/env node
'use strict';
const meow = require('meow');
const updateNotifier = require('update-notifier');
const openm = require('./index.js');
const opn = require('opn');
const sh = require('shelljs');
const npmName = require('npm-name');
const chalk = require('chalk');

const cli = meow([
  'Usage',
  '  $ openm',
  '',
  '  $ openm <module name>',
  '',
  'Examples',
  '$ openm',
  '//=> opens the npmjs module page for the current directory in browser',
  '',
  '$ openm express',
  '//=> opens the npmjs module page for express in browser',
  '',
  '$ openm inf sist openm',
  '//=>  opens the npmjs module pages for inf, sist, and openm in browser'
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
      opn(openm(myPackage), {wait: false});
    } else {
      throwErr(`package ${myPackage} not found`);
    }
  });
});
