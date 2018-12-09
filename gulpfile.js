/*
 * @Author: coderqiqin@aliyun.com 
 * @Date: 2018-12-09 14:30:18 
 * @Last Modified by: CoderQiQin
 * @Last Modified time: 2018-12-09 19:42:41
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

var paths = {
  sass: {
    src: 'src/css/**/*.+(scss|sass)',
    dist: 'dist/css',
    watch: ''
  },
  pug: {
    src: 'src/*.pug',
    dist: 'dist',
    watch: ''
  },
  bowerserify: {
    src: 'src/js/**/*.js',
    dist: 'dist/js'
  },
  image: {
    src: 'src/img/**/*.{jpg,png,gif,ico}',
    dist: 'dist/img'
  },
  lib: {
    src: 'src/lib/**/*',
    dist: 'dist/lib'
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

  gulp.watch('src/css/**/*.scss', ['sass'])
  gulp.watch('src/*.pug', ['pug'])
  gulp.watch('src/js/**/*.js', ['browserify'])
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

// FIXME: 编译过滤没修改的文件, 时间戳哈希值
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

// TODO: es6转换,browserify
gulp.task('browserify', function() {
  return gulp.src(paths.bowerserify.src)
        .pipe(plumber({
          errorHandler: notify.onError({
            title: 'JS编译报错:',
            message: '<%= error.message %>'
          })
        }))
        .pipe(uglify())
        .pipe(gulp.dest(paths.bowerserify.dist))
        .pipe(reload({ stream: true }))
})

gulp.task('image', function() {
  return gulp.src(paths.image.src)
        .pipe(gulp.dest(paths.image.dist))
})

// TODO: 默认任务,先同步执行clean/dist
gulp.task('clean', function() {
  return del('dist/')
})

gulp.task('lib', function() {
  return gulp.src(paths.lib.src)
        .pipe(gulp.dest(paths.lib.dist))
})

gulp.task('build', function() {
  // return gulp.src('')
})