const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production', // или 'development' для отладки
  entry: {
    background: './src/background.js',
    popup: './src/popup.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'Cookie Auto Crumbler Build'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/manifest.json', to: '.' },
        { from: './src/icons', to: 'icons' },
        { from: './src/popup.html', to: '.' },
        { from: './src/logo.png', to: '.' },
      ],
    }),
  ],
};