const webpack = require('webpack');
const prod = require('./webpack.config');

module.exports = Object.assign({}, prod, {
    devtool: 'cheap-source-map',

    module: {},

    entry: [
        'webpack/hot/dev-server',
        'webpack-hot-middleware/client',
        './app'
    ],

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});