const CACHE = 'koiki';
const FALLBACK = 'koiki-fallback';

const CACHE_URLS = [
  /\.js$/,
  /\.css$/,
  /\.woff$/,
  /\.woff2$/,
  /\.tff$/,
  /\.png$/,
  /\.jpg$/,
];

const FALLBACK_CONTENT_TYPES = [
  'text/html'
];

function fromCache(request, target) {
  return caches.open(target).then(cache =>
    cache.match(request.clone())
  );
}


function updateCache(request, response, target) {
  return caches.open(target).then(cache =>
      cache.put(request.clone(), response.clone())
  );
}

function fromServer(request) {
  return fetch(request.clone())
    .then((response) => {
      let promise = Promise.resolve();
      const shouldCache = CACHE_URLS.filter(target =>
        target.test(request.url)
      ).length !== 0;
      if (shouldCache) {
        promise = promise.then(() => updateCache(request, response, CACHE));
      }
      const shouldCacheFallback = FALLBACK_CONTENT_TYPES.filter(target =>
        target === response.headers.get('Content-Type')
      );
      if (shouldCacheFallback && response.status === 200) {
        promise = promise.then(() => updateCache(request, response, FALLBACK));
      }
      return promise.then(() => response);
    });
}

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] installed.');
  evt.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        '/images/favicon.png',
      ])
    )
  );
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    fromCache(evt.request, CACHE)
      .then(response =>
        response ||
        fromServer(evt.request)
      )
      .then(
        response => response,
        () => fromCache(evt.request, FALLBACK)
      )
  );
});
