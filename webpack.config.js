const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  entry: [
    './src/AutoCompleteTextField'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new MiniCssExtractPlugin({ filename: 'bundle.css' }),
    new ESLintPlugin()
  ],
  module: {
    rules: [
      { test: /\.js?$/, use: ['babel-loader'], exclude: /node_modules/ },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'], exclude: /node_modules/ }
    ]
  },
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules'
    ]
  }
};
