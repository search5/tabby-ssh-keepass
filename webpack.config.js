const path = require('path')

module.exports = {
    target: 'electron-renderer',
    mode: 'production',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: 'raw-loader',
            },
        ],
    },
    externals: {
        'tabby-core': 'commonjs tabby-core',
        'tabby-settings': 'commonjs tabby-settings',
        'tabby-ssh': 'commonjs tabby-ssh',
        'electron': 'commonjs electron',
        'keytar': 'commonjs keytar',
        '@angular/core': 'commonjs @angular/core',
        '@angular/common': 'commonjs @angular/common',
        '@angular/forms': 'commonjs @angular/forms',
        '@ng-bootstrap/ng-bootstrap': 'commonjs @ng-bootstrap/ng-bootstrap',
        '@electron/remote': 'commonjs @electron/remote',
    },
}
