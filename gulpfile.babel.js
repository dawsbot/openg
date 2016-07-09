'use strict';
const gulp = require('gulp');
const changed = require('gulp-changed');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const ava = require('gulp-ava');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');

const LERNA = 'packages/*'

const glob = require('glob');
const path = require('path');

const packages = glob.sync(LERNA).map(function(packageDir) {
  return path.basename(packageDir);
});

// build all packages
gulp.task('babel', packages.map(function(name){
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
      uglify()
      .pipe(gulp.dest(''));
    });
  });
  return `${name}-build`;
}));



gulp.task('ava', packages.map(function(name){
  packages.forEach((name) => {
    gulp.task(`${name}-ava`, () => {
      return gulp.src(`packages/${name}/src/test/test.js`)
        // gulp-ava needs filepaths so you can't have any plugins before it
        .pipe(ava())
    });
  });
  return `${name}-ava`;
}))

gulp.task('lint', packages.map(function(name){
  packages.forEach((name) => {
    gulp.task(`${name}-eslint`, () => {
      return gulp.src(`packages/${name}/src/**`)
        .pipe(eslint())
        .pipe(eslint.format())
    });
  });
  return `${name}-eslint`;
}));

gulp.task('test', ['ava', 'lint']);
gulp.task('build', ['babel']);
