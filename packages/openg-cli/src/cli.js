#!/usr/bin/env node

'use strict';
const meow = require('meow');
const updateNotifier = require('update-notifier');
const openg = require('openg');

const cli = meow(`
Usage
  $ openg [<options>]

  $ openg <module name(s)> [<options>]

Options
  -i, --issues  Open the issue page for specified modules
  -d, --dryRun  List what links would be opened instead of opening

Examples
  $ openg
  # opens the github repo page for the current directory in browser

  $ openg express
  # opens the github repo page for express in browser

  $ openg inf sist openg --issues
  #  opens the github issues pages for inf, sist, and openg in browser`,
  {
    alias: {
      i: 'issues',
      d: 'dryRun'
    }
  }
);

updateNotifier({pkg: cli.pkg}).notify();

openg(cli.input, cli.flags);
