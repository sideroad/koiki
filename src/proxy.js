import matcher from 'path-to-regexp';
import util from 'util';
import 'isomorphic-fetch';
import UrlPattern from 'url-pattern';

const fetcher = (options, res, after, logger) => {
  logger('# Proxing', ...options);
  fetch(...options)
    .then(
      apiRes =>
        apiRes
          .json()
          .then(
            (json) => new Promise((resolve) => {
              after(json, _json => {
                resolve(_json);
              });
            }),
            err => logger('# Parse Error ', {}, err) || res.json(err)
          )
          .then(
            json => res.status(apiRes.status).json(json)
          ),
      err => logger('# Fetch Error ', options, err) || res.json(err)
    ).catch(
      err => logger('# Unexpected Error ', {}, err) || res.json(err)
    );
};

export default function proxy({
  app,
  protocol,
  host,
  prefix,
  customizer,
  before = (url, options, cb) => cb([url, options]),
  after = (json, cb) => cb(json),
  logger = (title, data, err) => console.log(title, util.inspect(data), util.inspect(err))
}) {
  app.use(`${prefix}/*`, (req, res) => {
    const apiUri = req.originalUrl.replace(new RegExp(prefix), '');
    const url = `${protocol}://${host}${apiUri}`;
    const options = [url, {
      method: req.method,
      headers: {
        ...req.headers,
        host
      }
    }];
    const originalUrl = req.originalUrl.split('?')[0];
    if (req.body) {
      options[1].body = JSON.stringify(req.body);
    }
    let customizerBefore;
    let customizerAfter;
    let customizerOverride;
    if (customizer) {
      const keys = Object.keys(Object.assign({}, req.params)).map(key => ({
        name: key,
        prefix: '/',
        delimiter: '/'
      }));
      Object.keys(customizer).some(
        (uri) => {
          if (
            matcher(uri, keys).exec(originalUrl) &&
            customizer[uri] &&
            customizer[uri][req.method]
          ) {
            customizerBefore = customizer[uri][req.method].before;
            customizerAfter = customizer[uri][req.method].after;
            customizerOverride = customizer[uri][req.method].override;
            const pattern = new UrlPattern(uri);
            req.params = pattern.match(originalUrl);
          }
        }
      );
    }

    if (customizerOverride) {
      logger('# Proxing with override', url);
      customizerOverride(req, res);
    } else {
      (customizerBefore || before)(...options, fetchOptions =>
        fetcher(fetchOptions, res, customizerAfter || after, logger));
    }
  });
}
