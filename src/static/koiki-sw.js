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

const FALLBACK_URL = '/en/offline';

function createOfflineCache() {
  const request = new Request(FALLBACK_URL);
  return fetch(FALLBACK_URL)
    .then(response =>
      caches.open(FALLBACK).then(cache =>
        cache.put(request, response.clone())
      )
    );
}

function fromCache(request, target) {
  return caches.open(target).then(cache =>
    cache.match(request.clone())
  );
}

function fromFallback() {
  return fromCache(new Request(FALLBACK_URL), FALLBACK);
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
      return promise.then(() => response);
    });
}

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] installed.');
  evt.waitUntil(
    caches.open(CACHE)
      .then(cache =>
        cache.addAll([
          '/images/favicon.png',
        ])
      )
      .then(
        () => createOfflineCache()
      )
  );
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (evt) => {
  if (evt.request.method === 'GET') {
    evt.respondWith(
      fromCache(evt.request, CACHE)
        .then(response =>
          response ||
          fromServer(evt.request)
        )
        .then(
          response => response,
          err => evt.request.mode === 'navigate' ? fromFallback() : err
        )
    );
  } else {
    evt.respondWith(
      fetch(evt.request)
    );
  }
});
