const gulp = require('gulp');
const uglify = require('gulp-uglify');
const livereload = require('gulp-livereload');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const browserify = require('gulp-browserify');
const zip = require('gulp-zip');
const del = require('del');

// Files Paths
const DIST_PATH = 'www';
const SCRIPTS_PATH = 'public/js/**/*.js';
const STATIC_PATH = 'public/static/**/*';
const SCSS_PATH = 'public/scss/**/*.scss';
const IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,svg,gif}';
// const TEMPLATE_PATH = 'src/templates/**/*.hbs';

// Image Compression
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Style for SCSS
gulp.task('styles', () => {
    console.log('starting style task');

    return gulp.src(SCSS_PATH)
        .pipe(plumber(function(err) {
            console.log('Style task error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(DIST_PATH))
        .pipe(livereload());
});

// Scripts
gulp.task('scripts', function() {
    console.log('starting scripts task');

    return gulp.src(SCRIPTS_PATH)
        .pipe(plumber(function(err) {
            console.log('Scripts Task Error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(browserify())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(DIST_PATH))
        .pipe(livereload());
});

// Images
gulp.task('images', () => {
    return gulp.src(IMAGES_PATH)
        .pipe(imagemin(
            [
                imagemin.gifsicle(),
                imagemin.jpegtran(),
                imagemin.optipng(),
                imagemin.svgo(),
                imageminPngquant(),
                imageminJpegRecompress()
            ]
        ))
        .pipe(gulp.dest(DIST_PATH + '/images'));
});

gulp.task('raw-config', () => {
    return gulp.src(STATIC_PATH)
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('clean', () => {
    return del.sync([
        DIST_PATH
    ])
});

gulp.task('default', ['clean', 'images', 'styles', 'scripts', 'raw-config'], () => {
    console.log('Run default task');

});

gulp.task('build', ['default'], () => {
    console.log('Build');

});

gulp.task('export', () => {
    return gulp.src('www/**/*')
        .pipe(zip('website.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', ['default'], () => {
    gulp.run('default');
    require('./src/app.js');
    livereload.listen();
    gulp.watch([SCRIPTS_PATH], ['scripts']);
    gulp.watch([SCSS_PATH], ['styles']);
});