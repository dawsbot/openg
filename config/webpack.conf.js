const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: './dist',
    filename: 'bundle.js',
    library: 'commonjs2'
  },
  devtool: 'eval',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
