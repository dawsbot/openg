'use strict';
const gulp = require('gulp');
const changed = require('gulp-changed');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const ava = require('gulp-ava');
const xo = require('gulp-xo');

const LERNA = 'packages/*'

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



gulp.task('avaTask', packages.map(function(name){
  packages.forEach((name) => {
    gulp.task(`${name}-ava`, () => {
      return gulp.src(`packages/${name}/src/test/test.js`)
        // gulp-ava needs filepaths so you can't have any plugins before it
        .pipe(ava())
    });
  });
  return `${name}-ava`;
}))

gulp.task('xoTask', packages.map(function(name){
  packages.forEach((name) => {
    gulp.task(`${name}-ava`, () => {
      return gulp.src(`packages/${name}/src/**`)
        .pipe(xo())
    });
  });
  return `${name}-ava`;
}));

gulp.task('test', ['avaTask', 'xoTask']);
