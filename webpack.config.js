const webpack = require('webpack');
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
    context: __dirname,
    entry: {
        'lib':   './lib',
        'embed': './embed.js'
    },
    plugins: [
        new BabiliPlugin()
    ],
    output: {
        path: __dirname,
        publicPath: '/',
        filename: '[name].js'
    }
};