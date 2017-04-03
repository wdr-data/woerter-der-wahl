const webpack = require('webpack');

module.exports = {
    context: __dirname,
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
    },
    output: {
        path: __dirname,
        publicPath: '/',
        filename: 'bundle.js'
    }
};