'use strict';
const gulp = require('gulp');
const changed = require('gulp-changed');
const babel = require('gulp-babel');
const rename = require('gulp-rename');

const LERNA = 'packages/*'
const SRC = `${LERNA}/src/**`;
const DEST = 'packages';
// const DEST = `${LERNA}/dist`;
const debug = require('gulp-debug');
const glob = require('glob');
const path = require('path');

const packages = glob.sync(LERNA).map(function(packageDir) {
  return path.basename(packageDir);
});


// build all packages
gulp.task('build', packages.map(function(name){
  packages.forEach((name) => {
    gulp.task(`${name}-build`, () => {
      return gulp.src(`packages/${name}/src/**`, {base: process.cwd()})
      .pipe(rename(path => {
        path.dirname = path.dirname.replace('src', 'dist')
        return path;
      }))
      .pipe(debug())
      .pipe(babel({
        presets: [
        'es2015',
        'stage-2'
        ]
      }))
      .pipe(gulp.dest(''));
    });
  });
  return `${name}-build`;
}));
