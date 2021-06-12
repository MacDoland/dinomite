const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
    entry: './src/js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./src/html", to: "" },
                { from: "./src/audio", to: "audio" },
                { from: "./src/fonts", to: "fonts" },
                { from: "./src/images", to: "images" },
                { from: "./src/styles", to: "styles" },
            ],
        })
    ],
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        },
        {
            test: /\.html$/i,
            loader: 'html-loader',
        }]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
        }
    }
}