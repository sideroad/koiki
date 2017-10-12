#!/usr/bin/env node

// Webpack config for creating the production bundle.
const webpack = require('webpack');
const config = require('../config/prod.config');
const klawSync = require('klaw-sync');
const path = require('path');
const fs = require('fs');

webpack(config).run(function runFn(err, stats) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  if (stats.compilation.errors.length) {
    console.error(stats.compilation.errors);
    process.exit(1);
  }
  const cwd = process.cwd();
  const paths = [].concat(
    // static contents under koiki
    klawSync(path.resolve(__dirname, '../lib/static'), {nodir: true})
      .map(file => `/${path.relative(path.resolve(__dirname, '../lib/static'), file.path)}`)
      .filter(file => !/^koiki-sw/.test(path.basename(file))),
    // static contents under project
    klawSync(path.resolve(cwd, 'static'), {nodir: true})
      .map(file => `/${path.relative(path.resolve(cwd, 'static'), file.path)}`)
      .filter(file => !/^\./.test(path.basename(file)))
  );
  fs.writeFileSync(path.resolve(cwd, 'cache-targets.json'), JSON.stringify(paths), 'utf8');
  console.log('Compile succeeded.');
});
