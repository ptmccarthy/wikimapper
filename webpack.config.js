const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  mode: 'production',
  entry: {
    background: ['webextension-polyfill', './src/chrome/main.js'],
    wikimapper: './src/web/js/main.js'
  },
  output: {
    filename: '[name].js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      browser: 'webextension-polyfill'
    })
  ],
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
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        options: {
          helperDirs: [path.join(__dirname, 'src/web/js/hbs-helpers')],
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
}; 