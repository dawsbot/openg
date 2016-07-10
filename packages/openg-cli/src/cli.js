#!/usr/bin/env node

'use strict';
const meow = require('meow');
const updateNotifier = require('update-notifier');
const openg = require('openg');

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

openg(cli.input);
