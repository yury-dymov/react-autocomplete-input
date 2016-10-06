var path          = require('path');
var webpack       = require('webpack');
var nodeExternals = require('webpack-node-externals');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  eval: 'eval-source-map',
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
    new webpack.optimize.OccurenceOrderPlugin(),
    new ExtractTextPlugin('bundle.css')
  ],
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel', exclude: /node_modules/ },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }
    ]
  },
  resolve: {
    root: path.join(__dirname, 'src'),
    modulesDirectories: [ 'node_modules' ],
    extensions: ['', '.js', '.jsx']
  }
};
