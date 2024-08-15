// node.js Packages / Dependencies
import gulp from 'gulp';

const { task, src, dest, series, watch } = gulp;
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import uglify from 'gulp-uglify';
import rename from '@sequencemedia/gulp-rename';
import concat from 'gulp-concat';
import cleanCSS from '@sequencemedia/gulp-clean-css';
import imageMin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import pngQuint from 'imagemin-pngquant';
import browserSync from 'browser-sync';
const bs = browserSync.create();
import autoprefixer from 'gulp-autoprefixer';
import jpgRecompress from 'imagemin-jpeg-recompress';
import { deleteSync } from 'del';
import vinylPaths from 'vinyl-paths';


// Paths
var paths = {
    root: {
        www: './public_html',
    },
    src: {
        root: 'public_html/assets',
        html: 'public_html/**/*.html',
        css: 'public_html/assets/css/*.css',
        js: 'public_html/assets/js/*.js',
        vendors: 'public_html/assets/vendors/**/*.*',
        imgs: 'public_html/assets/imgs/**/*.+(png|jpg|gif|svg)',
        scss: 'public_html/assets/scss/**/*.scss'
    },
    dist: {
        root: 'public_html/dist',
        css: 'public_html/dist/css',
        js: 'public_html/dist/js',
        imgs: 'public_html/dist/imgs',
        vendors: 'public_html/dist/vendors'
    }
}

// Compile SCSS
task('sass', function () {
    return src(paths.src.scss)
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(dest(paths.src.root + '/css'))
        .pipe(browserSync.stream());
});

// Minify + Combine CSS
task('css', function () {
    return src(paths.src.css)
        .pipe(cleanCSS({ compatibility: 'ie11' }))
        .pipe(concat('steller.css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(paths.dist.css))
});

// Minify + Combine JS
task('js', function () {
    return src(paths.src.js)
        .pipe(uglify())
        .pipe(concat('steller.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(paths.dist.js))
        .pipe(bs.stream());
});

// Compress (JPEG, PNG, GIF, SVG, JPG)
task('img', function () {
    return src(paths.src.imgs)
        .pipe(imageMin([
            gifsicle(),
            mozjpeg(),
            optipng(),
            svgo(),
            pngQuint(),
            jpgRecompress()
        ]))
        .pipe(dest(paths.dist.imgs));
});

// copy vendors to dist
task('vendors', function () {
    return src(paths.src.vendors)
        .pipe(dest(paths.dist.vendors))
});

// clean dist
task('clean', function () {
    return src(paths.dist.root)
        .pipe(vinylPaths(deleteSync))
});

// Prepare all assets for production
task('build', series('sass', 'css', 'js', 'vendors', 'img'));


// Watch (SASS, CSS, JS, and HTML) reload browser on change
task('watch', function () {
    bs.init({
        server: {
            baseDir: paths.root.www
        }
    })
    watch(paths.src.scss, series('sass'));
    watch(paths.src.js).on('change', bs.reload);
    watch(paths.src.html).on('change', bs.reload);
});

task('deploy', function () {
})

task('default', series('build', 'watch'));
