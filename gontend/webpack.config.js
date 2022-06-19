const webpack = require('webpack');

module.exports = env => ({
  entry: `${__dirname}/src/index.tsx`,
  output: {
    path: `${__dirname}/static/gontend`,
    filename: 'gontend.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              errorsAsWarnings: true,
            },
          },
        ],
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
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
  ],
});
