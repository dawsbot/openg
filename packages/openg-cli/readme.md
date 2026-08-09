# openg-cli
[![npm version](https://img.shields.io/npm/v/openg.svg)](https://www.npmjs.com/package/openg)
[![CI](https://github.com/dawsbot/openg/actions/workflows/ci.yml/badge.svg)](https://github.com/dawsbot/openg/actions/workflows/ci.yml)
[![npm download count](http://img.shields.io/npm/dm/openg.svg?style=flat)](http://npmjs.org/openg-cli)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

> cli to open Github repos for npm modules in-browser

<br>

# CLI

## Install
```
$ npm install -g openg-cli
```

Requires Node.js 20 or newer.

<br>

## Usage

```sh
$ openg
# opens the github repo page for the current directory in browser

$ openg chalk
# opens the github repo page for chalk in browser

$ openg inf sist openg --issues
# opens the github issues pages for inf, sist, and openg in browser
```

<br>

More help
```sh
$ openg --help
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
    #  opens the github issues pages for inf, sist, and openg in browser
```

If some of the modules can't be resolved, the ones that can are still opened and
`openg` exits with code `1` after printing the failures.

<br>

## [FAQ](https://github.com/dawsonbotsford/openg#faq)

<br>

## Related
* [openm](https://github.com/dawsonbotsford/openm)
* [opent](https://github.com/dawsonbotsford/opent)

<br>

## License

MIT © [Dawson Botsford](http://dawsonbotsford.com)


---
If you like this, star it. If you want to follow me, follow me.
