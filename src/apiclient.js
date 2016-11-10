import __ from 'lodash';
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

const getHeader = (_headers, defaultHeaders) => {
  const headers = Object.assign({...defaultHeaders}, _headers);

  return {
    method: 'GET',
    headers: headers,
    mode: 'cors',
    credentials: 'include'
  };
};

const postHeader = (values, _headers, defaultHeaders) => {
  const headers = Object.assign({
    'Content-Type': 'application/json',
    ...defaultHeaders
  }, _headers);

  return {
    method: 'POST',
    headers: headers,
    body: JSON.stringify( values ),
    mode: 'cors',
    credentials: 'include'
  };
};

const patchHeader = (values, _headers, defaultHeaders) => {
  const headers = Object.assign({
    'Content-Type': 'application/json',
    ...defaultHeaders
  }, _headers);

  return {
    method: 'PATCH',
    headers: headers,
    body: JSON.stringify( values ),
    mode: 'cors',
    credentials: 'include'
  };
};


const deleteHeader = (values, _headers, defaultHeaders) => {
  const headers = Object.assign({
    'Content-Type': 'application/json',
    ...defaultHeaders
  }, _headers);

  return {
    method: 'DELETE',
    headers: headers,
    body: JSON.stringify( values ),
    mode: 'cors',
    credentials: 'include'
  };
};

export default class ApiClient {
  constructor(defaultHeaders = {}, logger = (...args) => console.log(...args)) {

    this.fetchJSON = ({url = '', method = 'GET', values = {}, headers }) => {

      if ( !url ) {
        throw new Error('URL does not specified');
      }

      return new Promise((resolve, reject) => {
        const _values = Object.assign({}, values);
        const _url = normalize(url, _values) + (method === 'GET' ? '?' + string(_values) : '');
        logger('## fetch ', _url, method, _values);

        fetch( _url, (method === 'GET' ? getHeader( headers, defaultHeaders ) :
                     method === 'POST' ? postHeader( _values, headers, defaultHeaders ) :
                     method === 'PATCH' ? patchHeader( _values, headers, defaultHeaders ) :
                     method === 'DELETE' ? deleteHeader( _values, headers, defaultHeaders ) : ''))
               .then(res => {
                 if ( !res.ok ) {
                   res.json().then((json) => {
                     reject(json);
                   }, ()=>{
                     reject({});
                   });
                 } else if ( method === 'GET' ) {
                   res.json().then((json) => {
                     resolve(json);
                   }, ()=>{
                     reject({});
                   });
                 } else {
                   resolve({});
                 }
               }, (err)=>{
                 reject(err);
               });
      });
    };
  }
}
