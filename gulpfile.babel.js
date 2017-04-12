import gulp from 'gulp';
import path from 'path';
import browserSync from 'browser-sync';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import PythonShell from 'python-shell';
import gulpPlugins from 'gulp-load-plugins';
import dlFonts from './scripts/fonts';
import imageminJpegoptim from 'imagemin-jpegoptim';
const $ = gulpPlugins();

import webpackConfigDev from './webpack.config.dev';
import webpackConfig from './webpack.config'

const webpackBundler = webpack(webpackConfigDev);

const dist = 'build';

gulp.task('styles', () => gulp.src('styles/main.sass')
    .pipe($.sass())
    .pipe(gulp.dest(path.join('.tmp', 'styles')))
);

gulp.task('templates', () => gulp.src('index.html')
    .pipe($.swig({
        defaults: { cache: false }
    }))
    .pipe(gulp.dest('.tmp'))
);

gulp.task('html', ['styles', 'templates'], () => gulp.src(path.join('.tmp', 'index.html'))
    .pipe($.usemin({
        path: './',
        css: [
            $.cssimport({ includePaths: ['styles'] }),
            $.cleanCss(),
            $.rev()
        ]
    }))
    .pipe($.if('*.html', $.htmlmin({
        collapseWhitespace: true,
        decodeEntities: true,
        minifyJS: true,
        removeComments: true,
        removeScriptTypeAttributes: true
    })))
    .pipe(gulp.dest(dist))
);

gulp.task('fonts', () => dlFonts(path.join(dist, 'fonts')));
gulp.task('fonts:develop', () => dlFonts('fonts'));

gulp.task('scripts', () => gulp.src('app.js')
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(dist))
);

gulp.task('serve', ['styles', 'templates', 'fonts:develop'], () => {
    browserSync.init({
        server: {
            baseDir: ['.tmp', './'],

            middleware: [
                webpackDevMiddleware(webpackBundler, {
                    // IMPORTANT: dev middleware can't access config, so we should
                    // provide publicPath by ourselves
                    publicPath: webpackConfigDev.output.publicPath,

                    // pretty colored output
                    stats: { colors: true }
                }),

                webpackHotMiddleware(webpackBundler)
            ]
        }
    });

    gulp.watch('index.html', ['templates', browserSync.reload]);
    gulp.watch('styles/**', ['styles', browserSync.reload]);
    gulp.watch(['*.js', 'lib/**/*.js'], browserSync.reload)
});

gulp.task('images', function() {
    return gulp.src('images/**/*')
        .pipe($.imagemin([
            imageminJpegoptim({ max: 70 }),
            $.imagemin.optipng({optimizationLevel: 5}),
            $.imagemin.svgo({plugins: [{removeViewBox: true}]})
        ], {
            verbose: true
        }))
        .pipe(gulp.dest(path.join(dist, 'images')));
});

gulp.task('data', cb => {
    PythonShell.run('wp-vb.py', {
        pythonPath: 'python3'
    }, cb);
});

gulp.task('data:prod', ['data'], () => gulp.src('output/**/*').pipe(gulp.dest(path.join(dist, 'output'))));

gulp.task('data-vis', ['data'], () => gulp.src('data.html')
        .pipe($.data(() => require('./output/gruene.json')))
        .pipe($.swig())
        .pipe(gulp.dest(dist))
);

gulp.task('build', ['data:prod', 'scripts', 'html', 'fonts']);

gulp.task('default', ['build']);