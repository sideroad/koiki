
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var strip = require('strip-loader');
var relativeAssetsPath = 'static/dist';
var cwd = process.cwd();
var assetsPath = path.join(cwd, relativeAssetsPath);
var rcPath = path.join(cwd, '.koikirc');
var rc = fs.existsSync(rcPath) ? fs.readJsonSync(rcPath) : {};
var env = require('../bin/lib/env');

var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools'));

module.exports = _.merge({
  devtool: 'source-map',
  context: cwd,
  entry: {
    'main': [
      path.resolve(cwd, 'src/client.js')
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/dist/'
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, use: [strip.loader('debug'), {
        loader: 'buble-loader',
        options: {
          objectAssign: 'Object.assign'
        }
      }]},
      { test: /\.css$/, use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 2,
              sourceMap: true
            }
          }, {
            loader: 'less-loader',
            options: {
              outputStyle: 'expanded',
              sourceMap: true,
              sourceMapContents: true
            }
          }]
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 2,
              sourceMap: true
            }
          }, {
            loader: 'sass-loader',
            options: {
              outputStyle: 'expanded',
              sourceMap: true,
              sourceMapContents: true
            }
          }]
        })
      },
      { test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/, use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff'
        }
      }]},
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/octet-stream'
        }
      }]},
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: "file-loader" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'image/svg+xml'
        }
      }]},
      { test: webpackIsomorphicToolsPlugin.regular_expression('images'), use: 'url-loader' }
    ],
  },
  resolve: {
    modules: [
      path.join(cwd, 'src'),
      'node_modules'
    ],
    extensions: ['.json', '.js', '.jsx'],
  },
  plugins: [
    new CleanPlugin([assetsPath], { root: cwd }),

    // css files from the extract-text-plugin loader
    new ExtractTextPlugin({
      filename: '[name]-[chunkhash].css',
      allChunks: true
    }),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      'process.env': env(),
    }),

    // ignore dev config
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),

    webpackIsomorphicToolsPlugin
  ],
  externals: {
    fs: '{}',
    express: '{}',
    passporter: '{}',
    passport: '{}'
  }
}, rc.webpack && rc.webpack.prod ? rc.webpack.prod : {});
