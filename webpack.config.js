const webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: {
        'lib':   './lib',
        'embed': './embed.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [ [ 'babili' ] ]
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