
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
    after = (_values, res) => new Promise(resolve => resolve(res))
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
                    res
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

export default class fetcher {
  constructor({urls, dispatch, client}) {

    Object.keys(urls).map(resource => {
      this[resource] = {};

      Object.keys(urls[resource]).map(action => {
        this[resource][action] = (values, options = {}) => {
          const _values = Object.assign( {}, urls[resource][action].defaults || {}, values);
          return exec({
            dispatch,
            client,
            url: urls[resource][action].url,
            method: urls[resource][action].method,
            after: urls[resource][action].after,
            mode: options.mode !== undefined ? options.mode : urls[resource][action].mode,
            credentials: options.credentials !== undefined ? options.credentials : urls[resource][action].credentials,
            headers: options.headers !== undefined ? options.headers : urls[resource][action].headers,
            values: _values,
            start: () => ({
              values: _values,
              type: resource + '/' + action.toUpperCase() + '_START'
            }),
            success: ({ body, res }) => ({
              values: _values,
              body,
              res,
              type: resource + '/' + action.toUpperCase() + '_SUCCESS'
            }),
            fail: ({ body, res, err }) => ({
              values: _values,
              body,
              res,
              err,
              type: resource + '/' + action.toUpperCase() + '_FAIL'
            })
          });
        };
      });
    });
  }
}
