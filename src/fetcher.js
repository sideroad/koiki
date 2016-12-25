import { parse as parseQs } from 'qs';
import pluck from './url-pluck';

const exec = ({
    dispatch,
    client,
    url,
    method,
    values,
    start,
    success,
    fail,
    mode,
    credentials,
    headers,
    after = (_values, res) => new Promise(resolve => resolve(res.body)),
    next
  }) => {
  dispatch(start(fetch.values));
  return client
          .fetchJSON({
            url,
            method,
            values,
            mode,
            credentials,
            headers
          })
          .then(
            (res) => {
              return after(values, res).then(
                converted => {
                  dispatch(success({
                    body: converted,
                    res,
                    next: next ? next(converted) : ''
                  }));
                  return Promise.resolve({
                    body: converted,
                    res: res.res
                  });
                }
              );
            },
            (res) => {
              dispatch(fail(res));
              return Promise.reject({
                body: res.body,
                res: res.res
              });
            }
          );
};

const generateNext = (applyWith, { action, options, resource, urls, next }) => {

  if (! next) {
    return Promise.resolve();
  }
  const values = parseQs(pluck(next, ['query']));
  return exec({
    ...options,
    start: () => ({
      values,
      type: resource + '/' + action.toUpperCase() + '_NEXT_START'
    }),
    success: ({ body, res, next: _next }) => {
      applyWith[resource][action].next = () => generateNext(applyWith, { action, options, resource, urls, next: _next });
      return ({
        values,
        body,
        res,
        type: resource + '/' + action.toUpperCase() + '_NEXT_SUCCESS',
        hasNext: urls[resource][action].next && _next ? true : false
      });
    },
    fail: ({ body, res, err }) => ({
      values,
      body,
      res,
      err,
      type: resource + '/' + action.toUpperCase() + '_NEXT_FAIL'
    }),
    values,
    url: pluck(next, ['protocol', 'auth', 'host', 'pathname'])
  });
};

export default class fetcher {
  constructor({urls, dispatch, client}) {

    Object.keys(urls).map(resource => {
      this[resource] = {};

      Object.keys(urls[resource]).map(action => {
        this[resource][action] = (_values, options = {}) => {
          const values = Object.assign( {}, urls[resource][action].defaults || {}, _values);
          const execOptions = {
            dispatch,
            client,
            url: urls[resource][action].url,
            method: urls[resource][action].method,
            after: urls[resource][action].after,
            next: urls[resource][action].next,
            mode: options.mode !== undefined ? options.mode : urls[resource][action].mode,
            credentials: options.credentials !== undefined ? options.credentials : urls[resource][action].credentials,
            headers: options.headers !== undefined ? options.headers : urls[resource][action].headers,
            values,
            start: () => ({
              values,
              type: resource + '/' + action.toUpperCase() + '_START'
            }),
            success: ({ body, res, next }) => {
              this[resource][action].next = () => generateNext(this, { action, options: execOptions, resource, urls, next });
              return ({
                values,
                body,
                res,
                type: resource + '/' + action.toUpperCase() + '_SUCCESS',
                hasNext: urls[resource][action].next && next ? true : false
              });
            },
            fail: ({ body, res, err }) => ({
              values,
              body,
              res,
              err,
              type: resource + '/' + action.toUpperCase() + '_FAIL'
            })
          };
          const promise = exec(execOptions);
          return promise;
        };
        this[resource][action].next = () => Promise.resolve();
      });
    });
  }
}
