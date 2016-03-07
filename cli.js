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

opn(openm(cli.input[0] || 'openm'), {wait: false});
