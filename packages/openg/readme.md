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
//=> returns a promise that opens the github page for the current directory in-browser

openg('express');
//=> returns a promise that opens the github page for express in-browser

openg(['inf', 'sist', 'openg'], {
  issues: true
});
//=>  returns a promise that opens the github issues pages for all in-browser
```
<br>

## API

### openg(target, [opts])

<br>

#### target

Type: `string` | `array`

npm modules name(s) you want to open in your browser

<br>

#### opts

Type: *optional* `object`

Pass these in to modify the behavior of `openg`

##### issues: true

Open the GitHub issues page for specified repo(s)

##### dryRun: true

Return the url's that would be opened and do **not** open them in-browser

Example usage:
```js
openg('openg', {
  issues: true,
  dryRun: true
}).then(resp => {
  console.log(resp);
});

//=> ['https://github.com/dawsonbotsford/openg/issues']
```

<br>

#### returns

Type: `promise`

Array of expected url value(s)

<br>

## License

MIT © [Dawson Botsford](http://dawsonbotsford.com)
