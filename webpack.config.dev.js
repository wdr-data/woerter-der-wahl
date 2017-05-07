const webpack = require('webpack');
const prod = require('./webpack.config');

module.exports = Object.assign({}, prod, {
    entry: {
        'lib':   './lib',
        'embed': './embed.js'
    },
    devtool: 'cheap-source-map',
    plugins: []
});