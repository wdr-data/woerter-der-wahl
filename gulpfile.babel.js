import gulp from 'gulp';
import fs from 'fs';
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
import ftp from 'vinyl-ftp';
import merge from 'merge-stream';
import marked from 'marked';
import buildIndex from './build-index';
const $ = gulpPlugins();

import webpackConfigDev from './webpack.config.dev';
import webpackConfig from './webpack.config'

const webpackBundler = webpack(webpackConfigDev);

require('dotenv').config({silent: true});

const dist = 'build';

gulp.task('styles', () => gulp.src('styles/{*, !_*}.sass')
    .pipe($.sass())
    .pipe(gulp.dest(path.join('.tmp', 'styles')))
);

const templatePipeline = () => $.swig({
    defaults: { cache: false }
});
gulp.task('templates', () => gulp.src('index.html')
    .pipe(templatePipeline())
    .pipe(gulp.dest('.tmp'))
);

const useminPipeline = () => $.usemin({
    path: './',
    css: [
        () => $.cssimport({ includePaths: ['styles'] }),
        () => $.cleanCss(),
        () => $.rev()
    ]
});
const htmlPipeline = () => $.htmlmin({
    collapseWhitespace: true,
    decodeEntities: true,
    minifyJS: true,
    removeComments: true,
    removeScriptTypeAttributes: true
});
gulp.task('embed', ['styles'], () => gulp.src('embed.html')
    .pipe(useminPipeline())
    .pipe($.if('*.html', htmlPipeline()))
    .pipe(gulp.dest(dist))
);

gulp.task('fonts', () => dlFonts(path.join(dist, 'fonts')));
gulp.task('fonts:develop', () => dlFonts('fonts'));

gulp.task('scripts', () => gulp.src(['lib/index.js', 'embed.js'])
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
                })
            ]
        }
    });

    gulp.watch('index.html', ['templates', browserSync.reload]);
    gulp.watch('styles/**', ['styles', browserSync.reload]);
    gulp.watch(['*.js', 'lib/**/*.js', 'elements/**/*'], browserSync.reload)
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

gulp.task('elements', ['styles'], () => gulp.src('elements/**/*', { base: '.' })
    .pipe($.usemin({
        path: './',
        css: [
            () => $.cssimport({ includePaths: ['styles'] }),
            () => $.cleanCss(),
            () => $.rev()
        ]
    }))
    .pipe($.if('**/info-text.html', $.template({
        infotext: marked(fs.readFileSync('content/info.md').toString(), { breaks: true })
    })))
    .pipe($.if('*.css', $.rename({ dirname: 'styles' })))
    .pipe(gulp.dest(path.join(dist)))
);

gulp.task('copy:dist', () => gulp.src([
        'bower_components/**/*.{js,html}'
    ], { base: './' })
        .pipe(gulp.dest(dist))
);

gulp.task('data-analyze', cb => {
    PythonShell.run('wp-vb.py', {
        pythonPath: 'python3'
    }, cb);
});

gulp.task('data-index', ['data-analyze'], () => buildIndex());

gulp.task('data', ['data-analyze', 'data-index']);

gulp.task('data:prod', ['data'], () => gulp.src('output/**/*').pipe(gulp.dest(path.join(dist, 'output'))));

const parties = ['all', 'spd', 'cdu', 'gruene', 'fdp', 'piraten', 'linke', 'afd'];
gulp.task('data-vis', ['styles', 'data'], () => gulp.src('data.html')
    .pipe($.data(() => ({
        lists: parties.map(party => ({
            party: party,
            words: require(`./output/${party}.json`).data.slice(0, 30)
        }))
    })))
    .pipe(templatePipeline())
    .pipe(useminPipeline())
    .pipe(gulp.dest(dist))
);

gulp.task('build', ['data:prod', 'copy:dist', 'scripts', 'html', 'fonts', 'images', 'elements', 'data-vis']);

gulp.task('upload', ['build'], () => {
    const conn = ftp.create({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        pass: process.env.FTP_PASS,
        log: $.util.log
    });

    return gulp.src([path.join(dist, '**')]/*, { buffer: false }*/)
        .pipe(conn.newer('/'))
        .pipe(conn.dest('/'));
});

gulp.task('default', ['build']);