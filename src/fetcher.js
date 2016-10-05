
const exec = ({dispatch, client, url, method, values, start, success, fail}) => {
  dispatch(start(fetch.values));
  return client
          .fetchJSON({
            url,
            method,
            values
          })
          .then(
            res => {
              dispatch(success(res));
              return res;
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
            values: _values,
            start: () => ({
              _values,
              type: resource + '/' + action.toUpperCase() + '_START'
            }),
            success: (res) => ({
              res,
              type: resource + '/' + action.toUpperCase() + '_SUCCESS'
            }),
            fail: (err) => ({
              err,
              type: resource + '/' + action.toUpperCase() + '_FAIL'
            })
          });
        };
      });
    });
  }
}
