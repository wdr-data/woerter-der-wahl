const webpack = require('webpack');
const prod = require('./webpack.config');

module.exports = Object.assign({}, prod, {
    devtool: 'cheap-source-map',

    module: {},

    entry: [
        './lib'
    ]
});