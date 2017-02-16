import gulp from 'gulp';
import PythonShell from 'python-shell';
import gulpPlugins from 'gulp-load-plugins';
const $ = gulpPlugins();

const dist = 'build';

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

gulp.task('build', ['data-vis']);

gulp.task('default', ['build']);