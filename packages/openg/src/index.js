'use strict';
const {execFileSync} = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const open = require('open');
const packageJson = require('package-json');
const arrify = require('arrify');
const hostedGitInfo = require('hosted-git-info');

// Uses execFile, never a shell string, so no repo-supplied value is interpreted
function git(arguments_, cwd) {
  try {
    return execFileSync('git', arguments_, {cwd, stdio: ['ignore', 'pipe', 'ignore']}).toString().trim();
  } catch {
    return undefined;
  }
}

function gitTopLevel() {
  return git(['rev-parse', '--show-toplevel']);
}

// `origin` if it exists, otherwise whichever remote is listed first
function gitRemoteUrl(cwd) {
  const origin = git(['remote', 'get-url', 'origin'], cwd);
  if (origin) {
    return origin;
  }

  const [first] = (git(['remote'], cwd) || '').split('\n');
  return first ? git(['remote', 'get-url', first], cwd) : undefined;
}

function readLocalManifest(topLevel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(topLevel, 'package.json'), 'utf8'));
  } catch {
    return undefined;
  }
}

// Plenty of packages ship no `homepage` or `bugs` but do point at a repo, so
// derive the browse and issues urls from `repository` rather than giving up.
// Handles every shape npm allows: shorthand ("user/repo"), a bare url string,
// an object, git:/git+ssh:/https: protocols, and a monorepo `directory`.
function repositoryUrls(json) {
  const {repository} = json;
  if (!repository) {
    return undefined;
  }

  const url = typeof repository === 'string' ? repository : repository.url;
  if (!url) {
    return undefined;
  }

  // Undefined for hosts hosted-git-info doesn't know (self-hosted git, etc.)
  const info = hostedGitInfo.fromUrl(url);
  if (!info) {
    return undefined;
  }

  const directory = typeof repository === 'object' ? repository.directory : undefined;

  return {
    browse: directory ? info.browse(directory) : info.browse(),
    bugs: info.bugs(),
  };
}

function urlFromManifest(json, options) {
  const repository = repositoryUrls(json);

  if (options.issues) {
    // `bugs` is usually an object, but npm also allows a bare url string
    const bugs = typeof json.bugs === 'string' ? json.bugs : json.bugs && json.bugs.url;
    return bugs || (repository && repository.bugs);
  }

  return json.homepage || (repository && repository.browse);
}

async function resolveUrl(name, options) {
  const json = await packageJson(name, {version: 'latest', fullMetadata: true});
  const url = urlFromManifest(json, options);

  if (!url) {
    const field = options.issues ? 'bugs' : 'homepage';
    throw new Error(`no "${field}" field, and no repository to infer one from, in the package.json of "${name}"`);
  }

  return url;
}

// With no module named, answer for the repo we're standing in. The local
// checkout is the truth here, not the registry: plenty of repos are unpublished,
// private, or have a directory name that doesn't match any npm package.
async function resolveCurrentDirectory(options) {
  const topLevel = gitTopLevel();
  if (!topLevel) {
    throw new Error('Specify one or more npm module names, none found');
  }

  const manifest = readLocalManifest(topLevel);
  if (manifest) {
    const url = urlFromManifest(manifest, options);
    if (url) {
      return url;
    }
  }

  // No manifest, or nothing useful in it - the git remote still knows
  const remote = gitRemoteUrl(topLevel);
  if (remote) {
    const info = hostedGitInfo.fromUrl(remote);
    if (info) {
      return options.issues ? info.bugs() : info.browse();
    }
  }

  // Last resort: the directory name might match a published module
  return resolveUrl(path.basename(topLevel), options);
}

async function openg(input, options) {
  options = {
    issues: false, dryRun: false, verbose: false, ...options,
  };

  const names = arrify(input).map(name => String(name).toLowerCase());

  // With no arguments, resolve the repo we're standing in instead
  const targets = names.length > 0
    ? names.map(name => () => resolveUrl(name, options))
    : [() => resolveCurrentDirectory(options)];

  // Settled, not `all`: one bad module name shouldn't stop the rest from opening
  const results = await Promise.allSettled(targets.map(async resolve => {
    const url = await resolve();

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
      : `${errors.length} of ${targets.length} modules could not be opened`);
  }

  return results.map(result => result.value);
}

module.exports = openg;
