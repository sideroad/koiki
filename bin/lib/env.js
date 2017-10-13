const KOIKI = /^KOIKI_/i;

module.exports = function() {
  const raw = Object.keys(process.env)
    .filter(key => KOIKI.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        NODE_ENV: process.env.NODE_ENV || 'development',
        GLOBAL_HOST: process.env.GLOBAL_HOST || 'localhost',
        GLOBAL_PORT: process.env.GLOBAL_PORT || '3000'
      }
    );
  // Stringify all values so we can feed into Webpack DefinePlugin
  return Object.keys(raw).reduce(
    (env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    },
    {}
  );
}
