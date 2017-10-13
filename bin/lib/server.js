
module.exports = function(callback){
  require('./server.babel'); // babel registration (runtime transpilation for node)
  var path = require('path');
  var cwd = process.cwd();
  /**
   * Define isomorphic constants.
   */
  global.__CLIENT__ = false;
  global.__SERVER__ = true;
  global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

  // https://github.com/halt-hammerzeit/webpack-isomorphic-tools
  var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
  global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../../config/webpack-isomorphic-tools'))
    .server(cwd, function() {
      require(path.join(cwd, 'src/server'));
      if (callback) {
        callback();
      }
    });

};
