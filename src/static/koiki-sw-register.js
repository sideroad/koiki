if (navigator.serviceWorker.controller) {
  console.log('[ServiceWorkerRegister] active service worker found, no need to register');
} else {
  //Register the ServiceWorker
  navigator.serviceWorker.register('/koiki-sw.js', {
    scope: './'
  }).then((reg) => {
    console.log(`[ServiceWorkerRegister] Service worker has been registered for scope:${reg.scope}`);
  });
}
