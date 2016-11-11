
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
    after = (_values, res) => new Promise(resolve => resolve(res))
  }) => {
  dispatch(start(fetch.values));
  return client
          .fetchJSON({
            url,
            method,
            values,
            mode,
            credentials
          })
          .then(
            res => {
              return after(values, res).then(
                converted => {
                  dispatch(success(converted));
                  return converted;
                }
              );
            },
            err => {
              dispatch(fail(err));
              throw err;
            }
          );
};

export default class fetcher {
  constructor({urls, dispatch, client}) {

    Object.keys(urls).map(resource => {
      this[resource] = {};

      Object.keys(urls[resource]).map(action => {
        this[resource][action] = (values) => {
          const _values = Object.assign( {}, urls[resource][action].defaults || {}, values);
          return exec({
            dispatch,
            client,
            url: urls[resource][action].url,
            method: urls[resource][action].method,
            after: urls[resource][action].after,
            mode: urls[resource][action].mode,
            credentials: urls[resource][action].credentials,
            values: _values,
            start: () => ({
              values: _values,
              type: resource + '/' + action.toUpperCase() + '_START'
            }),
            success: (res) => ({
              values: _values,
              res,
              type: resource + '/' + action.toUpperCase() + '_SUCCESS'
            }),
            fail: (err) => ({
              values: _values,
              err,
              type: resource + '/' + action.toUpperCase() + '_FAIL'
            })
          });
        };
      });
    });
  }
}
