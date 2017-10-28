import matcher from 'path-to-regexp';

export default function({
  dispatch,
  wsUrl,
  urls,
}) {
  const WebSocket = window.WebSocket || window.MozWebsocket;
  if (!WebSocket) {
    console.log('WebSocket is not defined');
    return null;
  }
  const ws = new WebSocket(wsUrl);
  const remap = [];
  Object.keys(urls).forEach((resource) => {
    Object.keys(urls[resource]).forEach((func) => {
      if (urls[resource][func].ws) {
        remap.push({
          matcher: matcher(urls[resource][func].ws),
          resource,
          func,
          method: urls[resource][func].method,
        });
      }
    });
  });

  ws.onopen = () => {
    console.log('connected!');
    ws.onmessage = (msg) => {
      const json = JSON.parse(msg);
      remap.forEach((item) => {
        const params = item.matcher.exec(json.uri);
        console.log(params);
        if (params && item.method === json.method) {
          dispatch({
            type: `${item.resource.toUpperCase()}_${item.func.toUpperCase()}`,
            data: json.data
          });
        }
      });
    };
  };

  ws.onclose = (...args) => {
    console.log(args);
  };
  return ws;
}
