const path = require('node:path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    "entry": './src/index.js',
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
                type: 'javascript/esm'
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[name][hash:8][ext]'
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][hash:8][ext]'
                }
            }
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: './index.html',
        })
    ],
    devServer: {
        static: './dist',
        port: 3000,
        open: true
    }
};