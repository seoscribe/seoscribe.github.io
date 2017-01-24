'use strict';

// lets use ES6 because why not?
// this polyfill is useless -- the ServiceWorker will not work in Chrome 40 due to arrow functions
// self.importScripts('https://seoscribe.net/assets/js/serviceworker-cache-polyfill.js');

const CACHE_VERSION = 1;
const CURRENT_CACHES = { prefetch: 'seoscribe-v' + CACHE_VERSION };

self.addEventListener('install', event => {
  const urlsToPrefetch = [
    'https://seoscribe.net/',
    'https://seoscribe.net/assets/css/main.css',
    'https://seoscribe.net/assets/js/main.js',
    'https://seoscribe.net/assets/js/event-listener-options.shim.js',
    'https://seoscribe.net/manifest.json',
    'https://seoscribe.net/perf.webm',
    'https://seoscribe.net/perf.mp4',
    'https://seoscribe.net/perf.gif',
    'https://seoscribe.net/perf.jpg',
    'https://seoscribe.net/favicon.ico',
    'https://seoscribe.net/404'
  ];
  event.waitUntil(
    self.caches.open(CURRENT_CACHES.prefetch).then(cache => {
      return cache.addAll(urlsToPrefetch);
    })
  );
});

self.addEventListener('activate', event => {
  const expectedCacheNames = self.Object.keys(CURRENT_CACHES).map(key => {
    return CURRENT_CACHES[key];
  });  
  event.waitUntil(
    self.caches.keys().then(cacheNames => {
      return self.Promise.all(
        cacheNames.map(cacheName => {
          if (expectedCacheNames.indexOf(cacheName) === -1){
            return self.caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    self.caches.match(event.request).then(response => {
      return response || self.fetch(event.request);
    })
  );
});
