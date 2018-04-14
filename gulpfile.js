var gulp = require('gulp');
var minify = require('gulp-minify');
var concat = require('gulp-concat');
var rm = require("gulp-rimraf");

gulp.task('clean', function () {
    gulp.src('dist/*').pipe(rm());
});

gulp.task('bundle', function () {
    return gulp.src([
        './lib/jquery-ext.js',
        './lib/params.js',
        './lib/ecliptik.js'
    ])
        .pipe(concat("ecliptik.js"))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('minify', function () {
    return gulp.src('./dist/ecliptik.js')
        .pipe(minify({
            ext: {
                src: ".js",
                min: ".min.js"
            }
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task("build", ["clean", "bundle", "minify"]);
gulp.task("default", ["build"]);
