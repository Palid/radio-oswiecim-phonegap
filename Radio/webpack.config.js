const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// assets.js
const Assets = require('./assets');

module.exports = {
    entry: './www/js/index.js',
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
            ...Assets.CSS.map(asset => {
                return {
                    from: path.resolve(__dirname, `./node_modules/${asset}`),
                    to: path.resolve(__dirname, './www/css/vendor/')
                };
            }),
            ...Assets.JS.map(asset => {
                return {
                    from: path.resolve(__dirname, `./node_modules/${asset}`),
                    to: path.resolve(__dirname, './www/js/vendor/')
                };
            }),
            ...Assets.FONTS.map(asset => {
                return {
                    from: path.resolve(__dirname, `./node_modules/${asset}`),
                    to: path.resolve(__dirname, './www/css/fonts/')
                };
            }),
        ]
    })
    ]
};