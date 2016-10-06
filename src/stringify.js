
export default function stringify(_uri, params) {
  let uri = _uri;
  Object.keys(params).forEach(key =>
    uri = uri.replace(':' + key, encodeURIComponent(params[key]))
  );
  if (/\:/.test(uri) ) {
    throw new Error('Required params are still in remained [' + uri + ']');
  }
  return uri;
}
