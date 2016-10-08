
export default function normalize(url) {
  let protocol = (url.match(/(http|https)\:\/\//) || [])[1];
  if ( /\:443$/.test(url) ) {
    protocol = protocol || 'https';
  } else {
    protocol = 'http';
  }
  return protocol + '://' + url.replace(/(\:80|\:443)$/, '');
}
