'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');

var angularTemplates = require('gulp-angular-templates');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license']
});

gulp.task('styles', function () {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sass())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size());
});

gulp.task('scripts', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.size());
});

gulp.task('partials', function () {
  return gulp.src('app/partials/**/*.html')
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.ngHtml2js({
      moduleName: 'shotbyshot',
      prefix: 'partials/'
    }))
    .pipe(gulp.dest('.tmp/partials'))
    .pipe($.size());
});

gulp.task('templates', function() {
  gulp.src('app/templates/**/*.html')
      .pipe(angularTemplates({
        basePath: 'templates/',
        module: 'shotbyshot'
      }))
      .pipe(gulp.dest('dist/templates'));

});

gulp.task('html', ['styles', 'scripts', 'partials', 'templates'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src('app/*.html')
    .pipe($.inject(gulp.src('.tmp/partials/**/*.js'), {
      read: false,
      starttag: '<!-- inject:partials -->',
      addRootSlash: false,
      addPrefix: '../'
    }))
    .pipe($.inject(gulp.src('dist/templates/*.js'), {
      read: false,
      starttag: '<!-- inject:templates -->',
      ignorePath: 'dist',
      addRootSlash: false
    }))
    .pipe($.useref())
    .pipe(gulpif('*.js', $.ngAnnotate()))
    .pipe(gulpif('*.js', $.uglify())) //to uglify js files
    .pipe(gulpif('*.css', $.csso())) //to uglify css files
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

gulp.task('clear', function () {
    return $.cache.clearAll();
});

gulp.task('fonts', function () {
  var fontPaths = $.mainBowerFiles();
  fontPaths.push('app/fonts/**/*');
  return gulp.src(fontPaths)
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size());
});

gulp.task('clean', function () {
  return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.rimraf());
});

gulp.task('build', ['html', 'partials', 'images', 'fonts']);
