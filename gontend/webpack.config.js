const webpack = require('webpack');

module.exports = env => ({
  entry: `${__dirname}/src/index.jsx`,
  output: {
    path: `${__dirname}/static/gontend`,
    filename: 'gontend.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader' },
        ],
      },
      {
        test: /\.(svg|png)$/,
        use: [
          { loader: 'url-loader' },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
  ],
});
