#!/usr/bin/env node
'use strict';
const meow = require('meow');
const updateNotifier = require('update-notifier');
const openm = require('./index.js');
const opn = require('opn');
const sh = require('shelljs');

const cli = meow([
  'Usage',
  '  $ openm <module name>',
  '',
  'Examples',
  '  $ openm express',
  '  //=>opens the npmjs module page in browser'
]);

updateNotifier({pkg: cli.pkg}).notify();

let packageName = cli.input[0];

const throwErr = () => {
  console.log(cli.help);
  process.exit(1);
};

if (cli.input.length === 0) {
  const revParse = sh.exec('git rev-parse --show-toplevel', {silent: true});
  if (revParse.code === 0) {
    const splitRevParse = revParse.stdout.split('/');
    packageName = splitRevParse[splitRevParse.length - 1];
  } else {
    console.error('Specify one npmjs package to open in browser');
    throwErr();
  }
}

if (cli.input.length > 1) {
  throwErr();
}

opn(openm(packageName), {wait: false});
