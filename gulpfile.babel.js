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
import cssSlam from 'css-slam';
import buildIndex from './build-index';
import { PolymerProject, HtmlSplitter, forkStream } from 'polymer-build';
const $ = gulpPlugins();
const cssSlamGulp = cssSlam.gulp;

import webpackConfigDev from './webpack.config.dev';
import webpackConfig from './webpack.config';

const polymerConfig = require('./polymer.json');
const polymerProject = new PolymerProject(polymerConfig);

const webpackBundler = webpack(webpackConfigDev);

require('dotenv').config({silent: true});

const dist = 'build';
const distLegacy = path.join(dist, 'legacy');

gulp.task('styles', () => gulp.src('styles/{*, !_*}.sass')
    .pipe($.sass())
    .pipe(gulp.dest(path.join('.tmp', 'styles')))
    .pipe($.cssimport({ includePaths: ['styles'] }))
    .pipe($.cleanCss())
    .pipe($.if('app.css', gulp.dest(path.join(dist, 'styles'))))
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
    ],
    js: [
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
gulp.task('embed', ['scripts:legacy', 'styles'], () => gulp.src('embed.html')
    .pipe(useminPipeline())
    .pipe($.if('*.html', htmlPipeline()))
    .pipe(gulp.dest(dist))
);

gulp.task('fonts', () => dlFonts(path.join(dist, 'fonts')));
gulp.task('fonts:develop', () => dlFonts('fonts'));

gulp.task('scripts:default', () => gulp.src(['lib/index.js'])
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest('.tmp'))
);

gulp.task('scripts:legacy', () => {
    const config = Object.assign({}, webpackConfig, {
        entry: {
            'lib':   './lib',
            'embed': './embed.js'
        },
        plugins: [],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        presets: [ [ 'es2015', { modules: false } ] ]
                    }
                }
            ]
        }
    });

    return gulp.src(['lib/index.js', 'embed.js'])
        .pipe(webpackStream(config, webpack))
        .pipe($.uglify())
        .pipe($.if('lib.js', gulp.dest(path.join('.tmp', 'legacy'))))
        .pipe($.if('embed.js', gulp.dest('.tmp')));
});

gulp.task('scripts', ['scripts:default', 'scripts:legacy']);

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

const defaultLoadFn = polymerProject.analyzer.loader.load
    .bind(polymerProject.analyzer.loader);
const myLoadFn = function(url) {
    if(url === 'lib.js') {
        return Promise.resolve('');
    }
    return defaultLoadFn(url);
};
polymerProject.analyzer.loader.load = myLoadFn.bind(polymerProject.analyzer.loader);

gulp.task('elements', ['scripts', 'styles'], () => {
    const sourceStream = polymerProject.sources()
        .pipe($.if('elements/info-text.html', $.template({
            infotext: marked(fs.readFileSync('content/info.md').toString(), {breaks: true})
        })))
        .pipe($.if('index.html', templatePipeline()))
        .pipe($.usemin({
            path: './',
            css: [
                () => $.cssimport({ includePaths: ['styles'] }),
                () => $.rev()
            ],
            js: [
                () => $.rev()
            ]
        }))
        .pipe($.if('*.css', $.rename({dirname: 'styles'})));

    const htmlcssPipeline = () =>
        $.if('*.css', cssSlamGulp())
        .pipe($.if('*.html', cssSlamGulp()))
        .pipe($.if('*.html', htmlPipeline()));

    const mainstream = merge(sourceStream, polymerProject.dependencies());

    // ES6 (default) stream
    const splitterDefault = new HtmlSplitter();
    const defaultStream = forkStream(mainstream)
        .pipe(splitterDefault.split())
        .pipe($.if('*.js', $.babili()))
        .pipe($.if('index.html_*.js', $.babel({ presets: ['es2015'] })))
        .pipe($.if('index.html_*.js', $.uglify()))
        .pipe(htmlcssPipeline())
        .pipe(splitterDefault.rejoin())
        .pipe(polymerProject.bundler())
        .pipe(gulp.dest(dist));

    // ES5 (legacy) stream
    const splitterLegacy = new HtmlSplitter();
    const legacyStream = forkStream(mainstream)
        .pipe(splitterLegacy.split())
        .pipe($.if('*.js', $.babel({ presets: ['es2015'] })))
        .pipe($.if('*.js', $.uglify()))
        .pipe(htmlcssPipeline())
        .pipe(splitterLegacy.rejoin())
        .pipe(polymerProject.bundler())
        .pipe(gulp.dest(distLegacy));

    return merge(defaultStream, legacyStream);
});

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

gulp.task('build:no-data', ['scripts', 'embed', 'fonts', 'images', 'elements']);

gulp.task('build', ['build:no-data', 'data:prod', 'data-vis']);

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