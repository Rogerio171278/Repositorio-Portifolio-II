const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg'); // ✅ Correção
const imageminPngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');

// **📌 Configuração de paths**
const paths = {
    root: { www: './public_html' },
    src: {
        root: 'public_html/assets',
        html: 'public_html/**/*.html',
        css: 'public_html/assets/css/*.css',
        js: 'public_html/assets/js/*.js',
        vendors: 'public_html/assets/vendors/**/*.*',
        imgs: 'public_html/assets/imgs/**/*.{png,jpg,gif,svg}',
        scss: 'public_html/assets/scss/**/*.scss'
    },
    dist: {
        root: 'public_html/dist',
        css: 'public_html/dist/css',
        js: 'public_html/dist/js',
        imgs: 'public_html/dist/imgs',
        vendors: 'public_html/dist/vendors'
    }
};

// **🟢 Compilar SCSS para CSS**
gulp.task('sass', function () {
    return gulp.src(paths.src.scss)
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'], cascade: false }))
        .pipe(gulp.dest(paths.src.root + '/css'))
        .pipe(browserSync.stream());
});

// **🟢 Minificar e Combinar CSS**
gulp.task('css', function () {
    return gulp.src(paths.src.css)
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(concat('johndoe.css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dist.css));
});

// **🟢 Minificar e Combinar JS**
gulp.task('js', function () {
    return gulp.src(paths.src.js)
        .pipe(uglify())
        .pipe(concat('johndoe.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(browserSync.stream());
});

// **🟢 Otimizar Imagens (Correção no uso do `imageminMozjpeg`)**
gulp.task('img', function () {
    return gulp.src(paths.src.imgs)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imageminMozjpeg({ quality: 75, progressive: true }), // ✅ Correção aplicada
            imageminPngquant({ quality: [0.6, 0.8] }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
            })
        ]))
        .pipe(gulp.dest(paths.dist.imgs));
});

// **🟢 Copiar Vendors**
gulp.task('vendors', function () {
    return gulp.src(paths.src.vendors)
        .pipe(gulp.dest(paths.dist.vendors));
});

// **🟢 Limpar Pasta Dist**
gulp.task('clean', function () {
    return gulp.src(paths.dist.root, { allowEmpty: true, read: false })
        .pipe(clean());
});

// **🟢 Preparar o Build Completo**
gulp.task('build', gulp.series('clean', 'sass', 'css', 'js', 'vendors', 'img'));

// **🟢 Observar Alterações e Recarregar Navegador**
gulp.task('watch', function () {
    browserSync.init({ server: { baseDir: paths.root.www } });
    gulp.watch(paths.src.scss, gulp.series('sass'));
    gulp.watch(paths.src.js).on('change', browserSync.reload);
    gulp.watch(paths.src.html).on('change', browserSync.reload);
    gulp.watch(paths.src.imgs).on('change', browserSync.reload);
    gulp.watch(paths.src.vendors).on('change', browserSync.reload);
});

// **🟢 Tarefa Padrão**
gulp.task('default', gulp.series('build', 'watch'));