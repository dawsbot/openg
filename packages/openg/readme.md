# openg
[![npm version](https://img.shields.io/npm/v/openg.svg)](https://www.npmjs.com/package/openg)
[![CI](https://github.com/dawsbot/openg/actions/workflows/ci.yml/badge.svg)](https://github.com/dawsbot/openg/actions/workflows/ci.yml)
[![npm download count](http://img.shields.io/npm/dm/openg.svg?style=flat)](http://npmjs.org/openg)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

> open Github repo pages for npm modules in your browser

<br>

## Install

```
npm install openg
```

Requires Node.js 20 or newer.

<br>

## Usage

```js
const openg = require('openg');

openg();
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

##### verbose: true

Print each url to stdout as it is resolved

<br>

#### returns

Type: `promise`

Resolves with an array of url value(s), in the same order as `target`.

Every module is attempted, so one bad name does not stop the others from
opening. If any of them fail, the promise rejects with an
[`AggregateError`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
whose `.errors` holds one error per failed module.

<br>

## License

MIT © [Dawson Botsford](http://dawsonbotsford.com)
