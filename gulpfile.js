const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');

// Configuração de paths (boa prática usar const para paths)
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

// Tarefas individuais (melhor organização)

// Compilar SCSS para CSS
gulp.task('sass', function () {
    return gulp.src(paths.src.scss)
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'], cascade: false }))
        .pipe(gulp.dest(paths.src.root + '/css')) // Destino: assets/css (arquivos não minificados)
        .pipe(browserSync.stream());
});

// Minificar e Combinar CSS
gulp.task('css', function () {
    return gulp.src(paths.src.css) // Origem: assets/css (arquivos compilados)
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(concat('johndoe.css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dist.css)); // Destino: dist/css (arquivos minificados)
});

// Minificar e Combinar JS
gulp.task('js', function () {
    return gulp.src(paths.src.js)
        .pipe(uglify())
        .pipe(concat('johndoe.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(browserSync.stream());
});

// Otimizar Imagens (imagemin-mozjpeg corrigido)
gulp.task('img', async function () {
    try {
        const imageminMozjpeg = (await import('imagemin-mozjpeg')).default;

        return gulp.src(paths.src.imgs)
            .pipe(imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imageminMozjpeg({ quality: 75, progressive: true }),
                imageminPngquant({ quality: [0.6, 0.8] }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
                })
            ]))
            .pipe(gulp.dest(paths.dist.imgs));
    } catch (error) {
        console.error("Erro ao otimizar imagens:", error);
        throw error; // Importante: lança o erro para o build falhar se a otimização de imagens falhar
    }
});

// Copiar Vendors
gulp.task('vendors', function () {
    return gulp.src(paths.src.vendors)
        .pipe(gulp.dest(paths.dist.vendors));
});

// Limpar Pasta Dist
gulp.task('clean', function () {
    return gulp.src(paths.dist.root, { allowEmpty: true, read: false })
        .pipe(clean());
});

// Tarefa de Build (ordem é crucial)
gulp.task('build', gulp.series('clean', 'sass', 'css', 'js', 'vendors', 'img'));

// Tarefas de Desenvolvimento

// Observar Alterações e Recarregar Navegador
gulp.task('watch', function () {
    browserSync.init({ server: { baseDir: paths.root.www } });
    gulp.watch(paths.src.scss, gulp.series('sass')); // Tarefa 'sass' separada para evitar reload excessivo
    gulp.watch(paths.src.js, gulp.series('js')).on('change', browserSync.reload); // Adicionado 'js'
    gulp.watch(paths.src.html).on('change', browserSync.reload);
    gulp.watch(paths.src.imgs, gulp.series('img')).on('change', browserSync.reload); // Adicionado 'img'
    gulp.watch(paths.src.vendors, gulp.series('vendors')).on('change', browserSync.reload); // Adicionado 'vendors'
});

// Tarefa Padrão (executada com 'gulp')
gulp.task('default', gulp.series('build', 'watch'));