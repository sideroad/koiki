import __ from 'lodash';
import hash from 'object-hash';
import {} from 'isomorphic-fetch';

const string = values => {
  return __.map(values, (value, key) =>
    encodeURIComponent(key) + '=' + encodeURIComponent(value)
  ).join('&');
};

const normalize = (_uri, params) => {
  let uri = _uri;
  Object.keys(params).forEach(key => {
    if ( uri.match( ':' + key ) ) {
      uri = uri.replace(new RegExp(':' + key, 'g'), encodeURIComponent(params[key]));
      delete params[key];
    }
  });
  return uri;
};

const getHeader = (_headers, defaultHeaders, mode, credentials) => {
  const headers = Object.assign({...defaultHeaders}, _headers);

  return {
    method: 'GET',
    headers: headers,
    mode,
    credentials
  };
};

const postHeader = (values, _headers, defaultHeaders, mode, credentials) => {
  const headers = Object.assign({
    'Content-Type': 'application/json',
    ...defaultHeaders
  }, _headers);

  return {
    method: 'POST',
    headers: headers,
    body: JSON.stringify( values ),
    mode,
    credentials
  };
};

const patchHeader = (values, _headers, defaultHeaders, mode, credentials) => {
  const headers = Object.assign({
    'Content-Type': 'application/json',
    ...defaultHeaders
  }, _headers);

  return {
    method: 'PATCH',
    headers: headers,
    body: JSON.stringify( values ),
    mode,
    credentials
  };
};


const deleteHeader = (values, _headers, defaultHeaders, mode, credentials) => {
  const headers = Object.assign({
    'Content-Type': 'application/json',
    ...defaultHeaders
  }, _headers);

  return {
    method: 'DELETE',
    headers: headers,
    body: JSON.stringify( values ),
    mode,
    credentials
  };
};

export default class ApiClient {
  constructor(defaultHeaders = {}, logger = (...args) => console.log(...args)) {
    const cached = {};
    this.fetchJSON = ({url = '', method = 'GET', values = {}, headers, mode, credentials, cache }) => {

      if ( !url ) {
        throw new Error('URL does not specified');
      }

      const _values = Object.assign({}, values);
      const _url = normalize(url, _values) + (method === 'GET' ? '?' + string(_values) : '');

      // return from cache
      const hashed = hash(_url);
      if (cache &&
          method === 'GET' &&
          cached[hashed]
      ) {
        logger('## return from cache ', _url, method, _values);
        return Promise.resolve(cached[hashed]);
      }

      return new Promise((resolve, reject) => {
        logger('## fetch ', _url, method, _values);

        fetch( _url, (method === 'GET' ? getHeader( headers, defaultHeaders, mode, credentials ) :
                     method === 'POST' ? postHeader( _values, headers, defaultHeaders, mode, credentials ) :
                     method === 'PATCH' ? patchHeader( _values, headers, defaultHeaders, mode, credentials ) :
                     method === 'DELETE' ? deleteHeader( _values, headers, defaultHeaders, mode, credentials ) : ''))
               .then(res => {
                 if ( !res.ok ) {
                   res.json().then((json) => {
                     reject({
                       body: json,
                       res
                     });
                   }, ()=>{
                     reject({
                       body: {},
                       res
                     });
                   });
                 } else if ( method === 'GET' ) {
                   res.json().then((json) => {
                     if (cache) {
                       cached[hashed] = {
                         body: __.cloneDeep(json),
                         res: __.cloneDeep(res)
                       };
                     }
                     resolve({
                       body: json,
                       res
                     });
                   }, ()=>{
                     reject({
                       body: {},
                       res
                     });
                   });
                 } else {
                   res.json().then((json) => {
                     resolve({
                       body: json,
                       res
                     });
                   }, () => {
                     resolve({
                       body: {},
                       res
                     });
                   });
                 }
               }, (err)=>{
                 reject({
                   body: {},
                   err: err
                 });
               });
      });
    };
  }
}
