#!/usr/bin/env node
import process from 'node:process';
import meow from 'meow';
import updateNotifier from 'update-notifier';
import openg from 'openg';

const cli = meow(`
Usage
  $ openg [<options>]

  $ openg <module name(s)> [<options>]

Options
  -i, --issues   Open the issue page for specified modules
  -d, --dryRun   List what links would be opened instead of opening
  -v, --verbose  Print each link as it is opened

Examples
  $ openg
  # opens the github repo page for the current directory in browser

  $ openg express
  # opens the github repo page for express in browser

  $ openg inf sist openg --issues
  #  opens the github issues pages for inf, sist, and openg in browser`,
{
  importMeta: import.meta,
  flags: {
    issues: {type: 'boolean', shortFlag: 'i'},
    dryRun: {type: 'boolean', shortFlag: 'd'},
    verbose: {type: 'boolean', shortFlag: 'v'},
  },
},
);

updateNotifier({pkg: cli.pkg}).notify();

try {
  // `--dryRun` promises a list of what would be opened, so make it print
  await openg(cli.input, {
    ...cli.flags,
    verbose: cli.flags.verbose || cli.flags.dryRun,
  });
} catch (error) {
  const errors = error instanceof AggregateError ? error.errors : [error];
  for (const each of errors) {
    console.error(each.message);
  }

  process.exit(1);
}
