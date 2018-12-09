/*
 * @Author: coderqiqin@aliyun.com 
 * @Date: 2018-12-09 14:30:18 
 * @Last Modified by: CoderQiQin
 * @Last Modified time: 2018-12-09 17:53:15
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
    uglify       = require('gulp-uglify'),
    del          = require('del');
// 捕获错误
var plumber = require('gulp-plumber'),
    notify  = require('gulp-notify')

gulp.task('default', ['sass', 'pug', 'browserify', 'image'], function() {
  browerSync.init({
    server: {
      baseDir: 'dist'
    }
  }, function(){
    console.log('少年,开始撸代码吧!');
  })

  gulp.watch('src/css/**/*.scss', ['sass'])
  gulp.watch('src/*.pug', ['pug'])
  gulp.watch('src/js/**/*.js', ['browserify'])
})

gulp.task('sass', function() {
  return gulp.src('src/css/**/*.+(scss|sass)')
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
        .pipe(gulp.dest('dist/css'))
        .pipe(filter('**/*.css'))
        .pipe(reload({stream: true}));
})

// FIXME: 编译过滤没修改的文件, 时间戳哈希值
gulp.task('pug', function(){
  var YOUR_LOCALS = {
    message: 'This app is powered by gulp.pug recipe for BrowserSync'
  };

  return gulp.src('src/*.pug')
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
        .pipe(gulp.dest('dist'))
        .pipe(reload({ stream: true }))
})

// TODO: es6转换,browserify
gulp.task('browserify', function() {
  return gulp.src('src/js/**/*.js')
        .pipe(plumber({
          errorHandler: notify.onError({
            title: 'JS编译报错:',
            message: '<%= error.message %>'
          })
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(reload({ stream: true }))
})

gulp.task('image', function() {
  return gulp.src('src/img/**/*.{jpg,png,gif,ico}')
        .pipe(gulp.dest('dist/img'))
})

// TODO: 默认任务,先同步执行clean/dist
gulp.task('clean', function() {
  return del('dist/')
})