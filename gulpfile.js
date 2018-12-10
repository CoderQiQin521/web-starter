/*
 * @Author: coderqiqin@aliyun.com 
 * @Date: 2018-12-09 14:30:18 
 * @Last Modified by: CoderQiQin
 * @Last Modified time: 2018-12-10 11:01:27
 */
var gulp         = require('gulp'),
    browerSync   = require('browser-sync').create(),
    reload       = browerSync.reload,
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS     = require('gulp-clean-css'),
    rename       = require('gulp-rename'),
    filter       = require('gulp-filter'),
    sourcemaps   = require('gulp-sourcemaps'),
    pug          = require('gulp-pug'),
    browserify   = require('browserify'),
    watchify     = require('watchify'),
    buffer       = require('vinyl-buffer'),
    source       = require('vinyl-source-stream'),
    assign       = require('lodash.assign'),
    gutil        = require('gulp-util'),
    uglify       = require('gulp-uglify'),
    del          = require('del')
    zip          = require('gulp-zip');

// 捕获错误
var plumber = require('gulp-plumber'),
    notify  = require('gulp-notify');

var paths = {
  sass: {
    src: 'src/css/**/*.+(scss|sass)',
    dist: 'dist/css',
    watch: 'src/css/**/*.scss'
  },
  pug: {
    src: 'src/*.pug',
    dist: 'dist',
    watch: 'src/*.pug'
  },
  bowerserify: {
    src: 'src/js/**/*.js',
    dist: 'dist/js',
    watch: 'src/js/**/*.js'
  },
  image: {
    src: 'src/img/**/*.{jpg,png,gif,ico}',
    dist: 'dist/img',
    watch: 'src/img/**/*'
  },
  lib: {
    src: 'src/lib/**/*',
    dist: 'dist/lib'
  },
  build: {
    src: 'dist/**/*',
    dist: './'
  }
}

gulp.task('default', ['sass', 'pug', 'browserify', 'image'], function() {
  browerSync.init({
    server: {
      baseDir: 'dist'
    }
  }, function(){
    console.log('少年,开始撸代码吧!');
  })

  gulp.watch(paths.sass.watch, ['sass'])
  gulp.watch(paths.pug.watch, ['pug'])
  gulp.watch(paths.image.watch, ['image'])
})

gulp.task('sass', function() {
  return gulp.src(paths.sass.src)
        .pipe(plumber({
          errorHandler: notify.onError({
            title: 'SASS编译报错:',
            message: '<%= error.message %>'
          })
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.sass.dist))
        .pipe(filter('**/*.css'))
        .pipe(reload({stream: true}));
})

// FIXME: 编译过滤没修改的文件
gulp.task('pug', function(){
  var YOUR_LOCALS = {
    message: 'This app is powered by gulp.pug recipe for BrowserSync'
  };

  return gulp.src(paths.pug.src)
        .pipe(plumber({
          errorHandler: notify.onError({
            title: 'PUG编译报错:',
            message: '<%= error.message %>'
          })
        }))
        .pipe(pug({
          pretty: true,
          locals: YOUR_LOCALS
        }))
        .pipe(gulp.dest(paths.pug.dist))
        .pipe(reload({ stream: true }))
})

var customOpts = {
  entries: ['src/js/entry.js'],
  debug: true
}
var opts = assign({}, watchify.args, customOpts)
var b = watchify(browserify(opts))
// TODO: es6转换
gulp.task('browserify', () => {
  return bundle()
})
b.on('update', bundle)

function bundle() {
  return b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        // .pipe(plumber({
        //   errorHandler: notify.onError({
        //     title: 'JS编译报错:',
        //     message: '<%= error.message %>'
        //   })
        // }))
        .pipe(source('main.js'))
        .pipe(buffer())
        // .pipe(uglify())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.bowerserify.dist))
        .pipe(filter('**/*.js'))
        .pipe(reload({ stream: true }))
}

gulp.task('image', () => {
  return gulp.src(paths.image.src)
        .pipe(gulp.dest(paths.image.dist))
})

// TODO: 默认任务,先同步执行clean/dist
gulp.task('clean', () => del('dist/'))

gulp.task('lib', () => gulp.src(paths.lib.src).pipe(gulp.dest(paths.lib.dist)))

// TODO: 时间戳哈希值, 混淆
gulp.task('build', () => {
  var project = process.cwd().split('/')
  return gulp.src(paths.build.src)
        .pipe(zip(project[project.length-1] + '.zip'))
        .pipe(gulp.dest(paths.build.dist))
})