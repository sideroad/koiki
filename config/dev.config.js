require('babel-polyfill');

// Webpack config for development
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var webpack = require('webpack');
var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
var cwd = process.cwd();
var assetsPath = path.resolve(cwd, 'static/dist');
var host = (process.env.HOST || 'localhost');
var port = parseInt(process.env.PORT) + 1 || 3001;
var rcPath = path.join(cwd, '.koikirc');
var rc = fs.existsSync(rcPath) ? fs.readJsonSync(rcPath) : {};
var env = require('../bin/lib/env');

// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools'));

module.exports = _.merge({
  devtool: 'inline-source-map',
  context: cwd,
  entry: {
    'main': [
      `webpack-dev-server/client?http://${host}:${port}/`,
      path.resolve(cwd, 'src/client.js'),
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: 'http://' + host + ':' + port + '/dist/'
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, use: [{
        loader: 'buble-loader',
        options: {
          objectAssign: 'Object.assign'
        }
      }, 'eslint-loader']},
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.less$/, use: [
        {
          loader: 'style-loader'
        },
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 2,
            sourceMap: true,
            localIdentName: '[local]___[hash:base64:5]'
          },
        },
        {
          loader: 'less-loader',
          options: {
            outputStyle: 'expanded',
            sourceMap: true
          }
        },
      ]},
      { test: /\.scss$/, use: [
        {
          loader: 'style-loader'
        },
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 2,
            sourceMap: true,
            localIdentName: '[local]___[hash:base64:5]'
          },
        },
        {
          loader: 'sass-loader',
          options: {
            outputStyle: 'expanded',
            sourceMap: true
          }
        },
      ]},
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: [ { loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } } ]},
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: ['file-loader'] },
      { test: webpackIsomorphicToolsPlugin.regular_expression('images'), use: ['url-loader'] }
    ],
  },
  resolve: {
    modules: [
      path.join(cwd, 'src'),
      'node_modules',
      path.join(cwd, 'i18n'),
    ],
    extensions: ['.json', '.js', '.jsx', '.properties'],
  },
  plugins: [
    new webpack.IgnorePlugin(/webpack-stats\.json$/),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      'process.env': env(),
    }),
    webpackIsomorphicToolsPlugin.development()
  ],
  externals: {
    fs: '{}'
  }
}, rc.webpack && rc.webpack.dev ? rc.webpack.dev : {});
