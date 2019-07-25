/*
 * @Author: coderqiqin@aliyun.com 
 * @Date: 2018-12-09 14:30:18 
 * @Last Modified by: CoderQiQin
 * @Last Modified time: 2019-07-25 11:59:12
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
    tsify        = require('tsify'),
    assign       = require('lodash').assign,
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
    watch: 'src/**/*.pug'
  },
  typescript: {
    src: 'src/js/**/*.ts',
    dist: 'dist/js',
    watch: 'src/js/**/*.ts'
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

gulp.task('default', ['sass', 'pug', 'tsc', 'image'], function() {
  browerSync.init({
    server: {
      baseDir: 'dist'
    },
    middleware: [
      {
        route: "/api",
        handle: function (req, res, next) {
          // handle any requests at /api
          console.log(res);
        }
      }
    ]
  }, function(){
    console.log('少年,开始撸代码吧!');
  })

  gulp.watch(paths.sass.watch, ['sass'])
  gulp.watch(paths.pug.watch, ['pug'])
  gulp.watch(paths.typescript.watch, ['tsc'])
  gulp.watch(paths.image.watch, ['image'])
})

gulp.task('tsc', function() {
  return browserify({
            basedir: '.',
            debug: true,
            entries: ['src/js/main.ts'],
            cache: {},
            packageCache: {}
        })
        .plugin(tsify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(paths.typescript.dist))
        .pipe(reload({stream: true}));
  // return tsProject.src(paths.typescript.src)
  //       .pipe(plumber({
  //         errorHandler: notify.onError({
  //           title: 'TypeScript编译报错:',
  //           message: '<%= error.message %>'
  //         })
  //       }))
  //       .pipe(tsProject())
  //       .pipe(gulp.dest('dist/js'))
  //       .pipe(reload({stream: true}));
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