var gulp = require('gulp'),
  sass = require('gulp-sass'),
  prefixer = require('gulp-autoprefixer'),
  eslint = require('gulp-eslint'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  bable = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps'),
  vulcanize = require('gulp-vulcanize'),
  preprocess = require('gulp-preprocess'),
  sequence = require('gulp-sequence'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  history = require('connect-history-api-fallback'),
  del = require('del'),
  config = require('./config');
  
var processVariables = config.production;

// builds html and styles
gulp.task('default', sequence('html', 'vulcanize', 'styles', 'lint', 'scripts:prod'));
gulp.task('build', ['default']);

// builds for github page
gulp.task('build:github', sequence('process:github', 'html', 'vulcanize', 'styles', 'lint', 'scripts:prod'));

// set as github process variables
gulp.task('process:github', function (cb) {
  processVariables = config.github;
  cb();
});

// lint JS files when attempting to commit changes to git
gulp.task('pre-commit', ['lint']);

// lint JS files
gulp.task('lint', function () {
  return gulp.src([
      config.src + '/js/**/*.js',
      '!' + config.src + '/js/config.js',
      '!' + config.src + '/js/vendor/**/*.js'
  ])
    .pipe(reload({stream: true, once: true}))
    .pipe(eslint())
    .pipe(eslint.format('stylish'))
    .pipe(eslint.failAfterError());
});

// copy html to dist folder
gulp.task('html', function () {
  return gulp.src(config.src + '/*.html')
    .pipe(preprocess(processVariables))
    .pipe(gulp.dest(config.dist));
});

// convert sass to css with autoprefix
gulp.task('styles', function () {
  return gulp.src(config.src + '/styles/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(prefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.dist + '/styles'))
    .pipe(browserSync.stream());
});

// concats JS files
gulp.task('scripts', function () {
  return gulp.src(config.src + '/js/**/*.js')
    .pipe(preprocess(processVariables))
    .pipe(sourcemaps.init())
    .pipe(bable())
    .pipe(concat('all.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.dist + '/js'))
})

// concats and minifies JS files
gulp.task('scripts:prod', function () {
  return gulp.src(config.src + '/js/**/*.js')
    .pipe(preprocess(processVariables))
    .pipe(bable())
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.dist + '/js'))
})

// reload file changes (html, js, scss)
gulp.task('live', ['build'], function () {
  // start file server
  browserSync({
    notify: false,
    port: process.env.PORT || 8081,
    ui: {
      port: 8081
    },
    server: {
      baseDir: [config.dist],
      routes: {
        '/node_modules': 'node_modules',
        '/bower_components': 'bower_components',
        '/styles': 'dist/styles'
      }
    },
    middleware: [history()]
  });
  // changes in src should recompile and reload
  gulp.watch(config.src + '/**/*.html', ['reload-html']);
  gulp.watch(config.src + '/js/**/*.js', ['reload-js']);
  gulp.watch(config.src + '/styles/**/*.scss', ['styles'], reload);
});

// run html tasks in sequence and then reload browser
gulp.task("reload-html", function (cb) {
  sequence('html', 'vulcanize', reload)(cb);
});

// run js tasks in sequence and then reload browser
gulp.task("reload-js", function (cb) {
  sequence('lint', 'scripts', reload)(cb);
});

// scrape all Polymer elements
gulp.task('vulcanize', function() {
  return gulp.src(config.src + '/elements/elements.html')
    .pipe(vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true,
      redirects: [
        '/bower_components|bower_components',
        '/elements|' + config.src + '/elements'
      ]
    }))
    .pipe(preprocess(processVariables))
    .pipe(gulp.dest(config.dist + '/elements'));
});

// removes all files from the dist folder
gulp.task("clean", function () {
  return del([config.dist + '/**', '!' + config.dist]);
});