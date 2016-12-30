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
              console.log(res);
              dispatch(fail(res));
              return Promise.reject({
                body: res.body,
                res: res.res
              });
            }
          );
};

const getExecOptions = (applyWith, {options, values, urls, dispatch, client, resource, action}) => ({
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
    console.log('success', resource, action);
    applyWith[resource][action].nextUrl = next;
    applyWith[resource][action].next = () => generateNext(applyWith, { // eslint-disable-line no-use-before-define
      action,
      options,
      resource,
      urls,
      next,
      dispatch,
      client
    });
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
});

const generateNext = (applyWith, { action, options, resource, urls, next, dispatch, client }) => {
  console.log('generateNext', resource, action);

  if (! next) {
    return Promise.resolve();
  }
  const values = parseQs(pluck(next, ['query']));
  return exec({
    ...getExecOptions(applyWith, {options, urls, dispatch, client, resource, action }),
    start: () => ({
      values,
      type: resource + '/' + action.toUpperCase() + '_NEXT_START'
    }),
    success: ({ body, res, next: _next }) => {
      applyWith[resource][action].nextUrl = _next;
      applyWith[resource][action].next = () => generateNext(applyWith, {
        action,
        options,
        resource,
        urls,
        next: _next,
        dispatch,
        client
      });
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


const deserialize = (applyWith, {serialized, resource, action, urls, dispatch, client}) => {
  if (serialized &&
      serialized[resource] &&
      serialized[resource][action] &&
      serialized[resource][action].nextUrl
  ) {
    applyWith[resource][action].next = () => generateNext(applyWith, {
      action,
      options: serialized[resource][action].options,
      resource,
      urls,
      next: serialized[resource][action].nextUrl,
      dispatch,
      client
    });
  } else {
    applyWith[resource][action].next = () => Promise.resolve();
  }
};

export default class fetcher {
  constructor({urls, dispatch, client, serialized}) {

    Object.keys(urls).map(resource => {
      this[resource] = {};

      Object.keys(urls[resource]).map(action => {
        this[resource][action] = (_values, options = {}) => {
          const values = Object.assign( {}, urls[resource][action].defaults || {}, _values);
          const execOptions = getExecOptions(this, { options, values, urls, dispatch, client, resource, action });
          this[resource][action].options = options;
          const promise = exec(execOptions);
          return promise;
        };
        console.log('constructor', resource, action);
        deserialize(this, {serialized, resource, action, urls, dispatch, client});
      });
    });
  }
  get(urls) {
    const serialized = {};
    Object.keys(urls).map(resource => {
      serialized[resource] = {};
      Object.keys(urls[resource]).map(action => {
        serialized[resource][action] = {
          nextUrl: this[resource][action].nextUrl,
          options: this[resource][action].options
        };
      });
    });
    return serialized;
  }
}
