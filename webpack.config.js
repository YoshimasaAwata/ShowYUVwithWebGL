const path = require('path');
module.exports = {
    mode: 'development',
    entry: {
        index: './src/index.ts',
    },
    output: {
        path: path.join(__dirname, 'dst/js'),
        filename: 'index.js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    devServer: {
        static: {
        directory: path.join(__dirname, 'dst'),
        },
        open: true,
    },
    module: {
        rules: [
        {
            test: /\.ts$/,
            loader: 'ts-loader',
        },
        ],
    },
    target: 'electron-main',
};
