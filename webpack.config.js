var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: { path: __dirname + '/lib/', filename: 'linkup.js' },
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      }
    ]
  },
};
