#!/usr/bin/env node

'use strict';
const meow = require('meow');
const updateNotifier = require('update-notifier');
const openg = require('openg');

const cli = meow([
  `Usage
     $ openg [<options>]

     $ openg <module name(s)> [<options>]

  Examples
    $ openg
    # opens the github repo page for the current directory in browser

    $ openg express
    # opens the github repo page for express in browser

    $ openg inf sist openg --issues
    #  opens the github issues pages for inf, sist, and openg in browser`
]);

updateNotifier({pkg: cli.pkg}).notify();

openg(cli.input, cli.flags);
