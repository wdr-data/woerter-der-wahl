const fs = require('fs-promise');
const path = require('path');
const _ = require('lodash');

const getIndex = function(data, keyLen, wordList) {
    wordList = wordList || false;
    return data.reduce((sum, d, k) => {
        const letter = d.word.toLowerCase().replace(/[^a-z]/g, '-').substr(0,keyLen);
        if(!(letter in sum)) {
            sum[letter] = wordList ? [] : {};
        }
        if(wordList) {
            sum[letter].push(d.word);
        } else {
            d.idx = k;
            sum[letter][d.word] = d;
        }
        return sum;
    }, {})
};

const canJsonObject = function(item) {
    return item !== null && item instanceof Object;
};

const writeIndex = function(pathName, entries) {
    return fs.ensureDir(pathName)
        .then(() => Promise.all(Object.keys(entries).map(k =>
            fs.writeJson(path.join(pathName, k + '.json'), canJsonObject(entries[k]) ? entries[k] : { data: entries[k] })
        )))
};

const buildIndex = function() {
    const words = require('./output/all.json').data;

    const index = getIndex(words, 2, true);
    const wordGroups = getIndex(words, 4);

    return Promise.all([
        writeIndex(path.join('output', 'index'), index),
        writeIndex(path.join('output', 'words'), wordGroups)
    ]);
};

if(require.main === module) {
    buildIndex().catch(console.error);
} else {
    module.exports = buildIndex;
}
