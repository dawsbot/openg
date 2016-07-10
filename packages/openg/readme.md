# openg
[![npm version](https://img.shields.io/npm/v/openg.svg)](https://www.npmjs.com/package/openg)
[![Build Status](https://travis-ci.org/dawsonbotsford/openg.svg?branch=master)](https://travis-ci.org/dawsonbotsford/openg)
[![npm download count](http://img.shields.io/npm/dm/openg.svg?style=flat)](http://npmjs.org/openg)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

> open Github repo pages for npm modules in your browser 

<br>

## Install

```
npm install --save openg
```

<br>

## Usage

```js
const openg = require('openg');

openg('hackathons');
//=> returns a promise that opens the github repo page for the current directory in browser


openg(express);
//=> returns a promise that opens the github repo page for express in browser


openg([inf, sist, openg]);
//=>  returns a promise that opens the github repo pages for inf, sist, and openg in browser
```
<br>

## API

### openg(target)

<br>

#### target

Type: `string` | `array`

<br>

#### returns

Type: `promise`

<br>

## License

MIT © [Dawson Botsford](http://dawsonbotsford.com)
