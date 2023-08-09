const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");




module.exports = {
    entry: './src/client/client.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: {
            three: path.resolve('./node_modules/three')
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../../dist/client'),
    },
    plugins: [
        new HtmlWebpackPlugin(
            // we can add a template later if we want to add more stuff to the html
            // {
            //     template: path.resolve(__dirname, '../index.html')
            // }
        ),
        new CopyPlugin({
            patterns: [
                {
                    from: "src/assets",
                    to: "assets"

                }
            ],
            options: {
                concurrency: 100,
            },
        }),
    ]
}
