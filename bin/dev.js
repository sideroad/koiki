#!/usr/bin/env node
require('babel-polyfill');

const webpack = require('webpack');

const watch = {
  host: 'localhost',
  port: 3001
};

const app = {
  host: 'localhost',
  port: 3000
};

const server = require('./lib/server');
const config = require('../config/dev.config');
const WebpackDevServer = require('webpack-dev-server');

const compiler = webpack(config);

server(function servercb() {
  const dev = new WebpackDevServer(compiler, {
    contentBase: 'http://' + watch.host + ':' + watch.port,
    quiet: true,
    noInfo: true,
    lazy: false,
    filename: config.output.filename,
    publicPath: config.output.publicPath,
    headers: {'Access-Control-Allow-Origin': '*'},
    stats: { colors: true }
  });
  dev.use(dev.middleware);
  dev.listen(watch.port, function devcb() {
    require('open')('http://' + app.host + ':' + app.port);
  });
});
