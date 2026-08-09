'use strict';
const {execSync} = require('node:child_process');
const path = require('node:path');
const open = require('open');
const packageJson = require('package-json');
const arrify = require('arrify');

// Fall back to the name of the repo we're standing in when no module is named
function packageOfCurrentDirectory() {
  let topLevel;
  try {
    topLevel = execSync('git rev-parse --show-toplevel', {stdio: ['ignore', 'pipe', 'ignore']}).toString();
  } catch {
    throw new Error('Specify one or more npm module names, none found');
  }

  return path.basename(topLevel.trim());
}

async function resolveUrl(name, options) {
  const json = await packageJson(name, {version: 'latest', fullMetadata: true});

  if (options.issues) {
    if (!json.bugs || !json.bugs.url) {
      throw new Error(`no "bugs" field found in the package.json of "${name}"`);
    }

    return json.bugs.url;
  }

  if (!json.homepage) {
    throw new Error(`no "homepage" field found in the package.json of "${name}"`);
  }

  return json.homepage;
}

async function openg(input, options) {
  options = {
    issues: false, dryRun: false, verbose: false, ...options,
  };

  let packages = arrify(input).map(name => String(name).toLowerCase());
  if (packages.length === 0) {
    packages = [packageOfCurrentDirectory()];
  }

  // Settled, not `all`: one bad module name shouldn't stop the rest from opening
  const results = await Promise.allSettled(packages.map(async name => {
    const url = await resolveUrl(name, options);

    if (options.verbose) {
      console.log(url);
    }

    if (!options.dryRun) {
      await open(url);
    }

    return url;
  }));

  const errors = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);

  if (errors.length > 0) {
    throw new AggregateError(errors, errors.length === 1
      ? errors[0].message
      : `${errors.length} of ${packages.length} modules could not be opened`);
  }

  return results.map(result => result.value);
}

module.exports = openg;
