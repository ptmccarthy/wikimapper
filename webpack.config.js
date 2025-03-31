const path = require('path');

module.exports = {
  devtool: 'source-map',
  mode: 'production',
  entry: {
    background: './src/chrome/main.js',
    wikimapper: './src/web/js/main.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
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