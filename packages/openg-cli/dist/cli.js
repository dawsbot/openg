#!/usr/bin/env node

'use strict';

var meow = require('meow');
var updateNotifier = require('update-notifier');
var openg = require('openg');

var cli = meow(['Usage', '  $ openg', '', '  $ openg <module name>', '', 'Examples', '$ openg', '//=> opens the github repo page for the current directory in browser', '', '$ openg express', '//=> opens the github repo page for express in browser', '', '$ openg inf sist openg', '//=>  opens the github repo pages for inf, sist, and openg in browser']);

updateNotifier({ pkg: cli.pkg }).notify();

console.log(openg(cli.input));