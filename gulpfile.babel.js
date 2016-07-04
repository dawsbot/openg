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

gulp.task('default', () => {
    return gulp.src(SRC)
        .pipe(debug('before': '1'))
        .pipe(rename((path) => {
          path.dirname.replace('src', 'dist');
          return path;
        }))
				.pipe(debug())
				.pipe(babel({
					presets: [
						'es2015',
						'stage-2'
					]
				}))
        .pipe(changed(DEST))
        .pipe(gulp.dest(DEST));
});
