#!/usr/bin/env node

// Webpack config for creating the production bundle.
var webpack = require('webpack');
var config = require("../config/prod.config");

webpack(config).run(function(err, stats){
  if (err) {
    console.error(err);
    process.exit(1);
  }
  if (stats.compilation.errors.length) {
    console.error(stats.compilation.errors);
    process.exit(1);
  }
  console.log('Compile succeeded.');
});
