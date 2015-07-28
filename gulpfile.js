var gulp = require('gulp');
var rename = require('gulp-rename');

// Build
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();

// Style
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

// Development Dependencies
var jshint = require('gulp-jshint');

// Test Dependencies
var mochaPhantomjs = require('gulp-mocha-phantomjs');

// JSHint
gulp.task('lint-client', function() {
  return gulp.src('./client/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint-test', function() {
  return gulp.src('./test/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Browserify
gulp.task('browserify-client', ['lint-client'], function() {
  return browserify('client/index.js', { insertGlobals: true })
    .bundle()
    .pipe(source('converter.js'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/js'));

    browserSync.reload;
});

gulp.task('browserify-test', ['lint-test'], function() {
  return browserify('test/client/index.js', { insertGlobals: true })
    .bundle()
    .pipe(source('client-test.js'))
    .pipe(gulp.dest('build'));
});

// Serve
gulp.task('serve', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
});

// Testing
gulp.task('test', ['lint-test', 'browserify-test'], function() {
  return gulp.src('test/client/index.html')
    .pipe(mochaPhantomjs());

});

gulp.task('watch', function() {
  gulp.watch('client/**/*.js', ['browserify-client', 'test']);
  gulp.watch('test/client/**/*.js', ['test']);


});

gulp.task('bootstrap', function() {
  return gulp.src('node_modules/bootstrap/dist/css/bootstrap.min.css')
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/css'));
});

// Assets
gulp.task('styles', ['bootstrap'], function() {
  return gulp.src('client/less/index.less')
    .pipe(less())
    .pipe(prefix({ cascade: true }))
    .pipe(rename('converter.css'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('minify', ['styles'], function() {
  return gulp.src('build/converter.css')
    .pipe(minifyCSS())
    .pipe(rename('converter.min.css'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('uglify', ['browserify-client'], function() {
  return gulp.src('build/converter.js')
    .pipe(uglify())
    .pipe(rename('converter.min.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('build', ['uglify', 'minify']);

gulp.task('default', ['test', 'build', 'watch', 'serve']);
