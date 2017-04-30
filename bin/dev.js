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

require('./lib/server')(function servercb() {
  const config = require('../config/dev.config');
  const WebpackDevServer = require('webpack-dev-server');
  const compiler = webpack(config);

  const dev = new WebpackDevServer(compiler, {
    contentBase: 'http://' + watch.host + ':' + watch.port,
    quiet: true,
    noInfo: true,
    reload: true,
    inline: true,
    lazy: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    publicPath: config.output.publicPath,
    headers: {'Access-Control-Allow-Origin': '*'},
    stats: {colors: true}
  });
  compiler.plugin('done', function donecb() {
    dev.listen(watch.port, function devcb() {
      require('open')('http://' + app.host + ':' + app.port);
    });
  });
});
