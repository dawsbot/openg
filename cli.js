#!/usr/bin/env node
'use strict';
const meow = require('meow');
const updateNotifier = require('update-notifier');
const openm = require('./index.js');
const opn = require('opn');

const cli = meow([
  'Usage',
  '  $ openm <module name>',
  '',
  'Examples',
  '  $ openm express',
  '  //=>opens the npmjs module page in browser'
]);

updateNotifier({pkg: cli.pkg}).notify();

if (cli.input.length !== 1) {
  console.error('Specify one npmjs package to open in browser');
  console.log(cli.help);
  process.exit(1);
}
opn(openm(cli.input[0] || 'openm'), {wait: false});
