# openm
[![npm version](https://img.shields.io/npm/v/openm.svg)](https://www.npmjs.com/package/openm)
[![Build Status](https://travis-ci.org/dawsonbotsford/openm.svg?branch=master)](https://travis-ci.org/dawsonbotsford/openm)
[![npm download count](http://img.shields.io/npm/dm/openm.svg?style=flat)](http://npmjs.org/openm)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

> open an npmjs module page in your browser

<br>

![demo](demo.gif)

<br>

# CLI

## Install
```
$ npm install -g openm
```

## Usage

```
$ openm
  //=>opens the npmjs module page for the current directory in browser

$ openm chalk
  //=>opens the npmjs module page for chalk in browser

```

<br>

More help
```
$ openm --help

  Usage  
    $ openm
      //=>opens the npmjs module page for the current directory in browser

    $ openm <module name>
      //=>opens the npmjs module page for <module name> in browser'

  Examples  
    $ openm express
    //=>opens the npmjs module page for express in browser
```

<br>

---
# Package

## Install
```
npm install --save openm
```

<br>

## Usage

```js
const openm = require('openm');

openm('express');
//=> 'https://npmjs.com/module/express'
```

<br>

## API

### openm(target)

##### target

Type: `string`

Return the npmjs module page url as a string.

<br>

## License

MIT © [Dawson Botsford](http://dawsonbotsford.com)


---
If you like this, star it. If you want to follow me, follow me.
