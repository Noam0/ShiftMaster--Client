const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');  // Import HtmlWebpackPlugin

module.exports = {
    mode: 'production',
    entry: {
        main: './src/scripts.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: { minimize: true }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: './index.html'
        }),
        new HtmlWebpackPlugin({
            template: './src/all_notes.html',
            filename: './all_notes.html'
        }),
        new HtmlWebpackPlugin({
            template: './src/new_note.html',
            filename: './new_note.html'
        })
    ]
};
