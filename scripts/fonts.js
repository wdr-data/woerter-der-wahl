import gulp from 'gulp';
import path from 'path';
import fs from 'fs';
import url from 'url';
import cssUrlParser from 'css-url-parser';
import gulpDownload from 'gulp-download';

export default function(dest) {
    const urls = cssUrlParser(fs.readFileSync('styles/fonts.css').toString())
        .filter(pathStr => !fs.existsSync(path.join(dest, pathStr)))
        .map(urlStr => url.resolve("http://www1.wdr.de/resources/fonts/", urlStr));

    if(urls.length == 0) {
        return gulp.src([]);
    }

    return gulpDownload(urls)
        .pipe(gulp.dest(dest));
};