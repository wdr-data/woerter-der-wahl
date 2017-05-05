const webpack = require('webpack');
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
    context: __dirname,
    entry: {
        'lib':   './lib'
    },
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
        filename: '[name].js'
    }
};