var gulp = require('gulp'),
  sass = require('gulp-sass'),
  prefixer = require('gulp-autoprefixer'),
  eslint = require('gulp-eslint'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps'),
  vulcanize = require('gulp-vulcanize'),
  crisper = require('gulp-crisper'),
  gif = require('gulp-if'),
  preprocess = require('gulp-preprocess'),
  sequence = require('gulp-sequence'),
  htmlmin = require('gulp-htmlmin'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  history = require('connect-history-api-fallback'),
  del = require('del'),
  config = require('./config');
  
var processVariables = config.production;

// builds html and styles
gulp.task('default', sequence('copy', 'styles', 'lint', 'vulcanize', 'html', 'scripts:prod'));
gulp.task('build', ['default']);

// builds for github page
gulp.task('build:github', sequence('process:github', 'build'));

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
gulp.task('html', sequence('html-index', 'html-elements'));

gulp.task('html-index', function () {
  return gulp.src('index.html')
    .pipe(preprocess(processVariables))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeCommentsFromCDATA: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest(config.dist));
});

gulp.task('html-elements', function () {
  return gulp.src(config.tmp + '/elements/elements.html')
    .pipe(preprocess(processVariables))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeCommentsFromCDATA: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest(config.dist + '/elements/'));
});

// copy files to dist folder
gulp.task('copy', function () {
  return gulp.src([
    'favicon.ico',
    'manifest.json',
    'sw-precache-config.json',
    'sw-import.js',
    'static/**/*.*',
    'bower_components/webcomponentsjs/webcomponents-lite.min.js',
    'bower_components/platinum-sw/bootstrap/*.js',
    'bower_components/sw-toolbox/sw-toolbox.js',
    'bower_components/platinum-sw/service-worker.js'
  ], {base: './'})
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
  return gulp.src([config.tmp + '/elements/**/*.{js,html}'])
    .pipe(preprocess(processVariables))
    .pipe(gif('*.html', crisper({
      scriptInHead: false,
      onlySplit: false
    })))
    .pipe(sourcemaps.init())
    .pipe(gif('*.js', babel()))
    //.pipe(concat('all.js'))
    .pipe(sourcemaps.write('.'))
    //.pipe(gulp.dest(config.tmp))
    .pipe(gulp.dest(config.dist));
});

// concats and minifies JS files
gulp.task('scripts:prod', function () {
  return gulp.src([config.src + '/js/**/*.js', config.tmp + '/elements/**/*.js'])
    //.pipe(preprocess(processVariables))
    //.pipe(sourcemaps.init())
    //.pipe(babel())
    .pipe(concat('elements.js'))
    .pipe(uglify())
    //.pipe(sourcemaps.write('.'))
    //.pipe(gulp.dest(config.tmp))
    .pipe(gulp.dest(config.dist + '/elements/'));
});

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
      baseDir: [config.dist, 'static'],
      routes: {
        '/node_modules': 'node_modules',
        '/bower_components': 'bower_components',
        '/styles': 'dist/styles',
        '/static': 'static'
      }
    },
    middleware: [history()]
  });
  // changes in src should recompile and reload
  gulp.watch(config.src + '/**/*.{js,html}', ['reload']);
  gulp.watch(config.src + '/styles/**/*.scss', ['styles'], reload);
});

// run html tasks in sequence and then reload browser
gulp.task('reload', function (cb) {
  sequence('lint', 'vulcanize', 'html', 'scripts:prod', reload)(cb);
});

// scrape all Polymer elements
gulp.task('vulcanize', function() {
  return gulp.src(config.src + '/elements/elements.html')
    .pipe(vulcanize({
      abspath: '',
      excludes: [],
      stripExcludes: false,
      stripComments: true,
      inlineCss: true,
      inlineScripts: true,
      redirects: [
        '/bower_components|bower_components',
        '/elements|' + config.src + '/elements'
      ]
    }))
    .pipe(preprocess(processVariables))
    .pipe(crisper({
      scriptInHead: false,
      onlySplit: true
    }))
    .pipe(gulp.dest(config.tmp + '/elements'));
    //.pipe(gulp.dest(config.dist + '/elements'));
});

// removes all files from the dist folder
gulp.task('clean', function () {
  return del([config.dist + '/**', '!' + config.dist]);
});