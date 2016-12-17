import matcher from 'path-to-regexp';
import {} from 'isomorphic-fetch';

export default function proxy({
  app,
  protocol,
  host,
  prefix,
  before = (...args) => args,
  after = args => args,
  customizer,
  logger = (...args) => console.log(...args)
}) {
  app.use(`${prefix}/*`, (req, res) => {
    const apiUri = req.originalUrl.replace(new RegExp(prefix), '');
    const url = `${protocol}://${host}${apiUri}`;
    let options = [url, {
      method: req.method,
      headers: {
        ...req.headers,
        host
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : ''
    }];
    let customizerBefore;
    let customizerAfter;
    let customizerOverride;
    if (customizer) {
      const keys = Object.keys(req.params).map(key => ({
        name: key,
        prefix: '/',
        delimiter: '/'
      }));
      Object.keys(customizer).some(
        (uri) => {
          if (
            matcher(uri, keys).exec(req.originalUrl.split('?')[0]) &&
            customizer[uri] &&
            customizer[uri][req.method]
          ) {
            customizerBefore = customizer[uri][req.method].before;
            customizerAfter = customizer[uri][req.method].after;
            customizerOverride = customizer[uri][req.method].override;
          }
        }
      );
    }

    if (customizerOverride) {
      logger('# Proxing with override', url);
      customizerOverride(req, res);
    } else {
      options = customizerBefore ? customizerBefore(...options) : before(...options);
      logger('# Proxing', ...options);
      fetch(...options)
        .then(
          apiRes =>
            apiRes
              .json()
              .then(
                json => res.json(customizerAfter ? customizerAfter(json) : after(json)),
                err => logger('#Parse Error ', err) || res.json(err)
              ),
          err => logger('#Fetch Error ', options, err) || res.json(err)
        ).catch(
          err => logger('#Unexpected Error ', err) || res.json(err)
        );
    }
  });
}
