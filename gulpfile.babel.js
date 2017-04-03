import gulp from 'gulp';
import path from 'path';
import browserSync from 'browser-sync';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import PythonShell from 'python-shell';
import gulpPlugins from 'gulp-load-plugins';
const $ = gulpPlugins();

import webpackConfigDev from './webpack.config.dev';
import webpackConfig from './webpack.config'

const webpackBundler = webpack(webpackConfigDev);

const dist = 'build';

gulp.task('styles', () => gulp.src('styles/main.sass')
    .pipe($.sass())
    .pipe(gulp.dest(path.join('.tmp', 'styles')))
    .pipe(gulp.dest(path.join(dist, 'styles')))
);

gulp.task('scripts', () => gulp.src('app.js')
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(dist))
);

gulp.task('copy:dist', () => gulp.src(['index.html'])
    .pipe(gulp.dest(dist))
);

gulp.task('serve', ['styles'], () => {
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

    gulp.watch(['*.html', '*.js'], browserSync.reload);
    gulp.watch('styles/**', ['styles', browserSync.reload]);
});

gulp.task('data', cb => {
    PythonShell.run('data_vb.py', {
        pythonPath: 'python3'
    }, cb);
});

gulp.task('data-vis', ['data'], () => {
    return gulp.src('data.html')
        .pipe($.data(() => require('./output/gruene.json')))
        .pipe($.swig())
        .pipe(gulp.dest(dist));
});

gulp.task('build', ['scripts', 'copy:dist']);

gulp.task('default', ['build']);