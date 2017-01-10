'use strict';

self.importScripts('https://seoscribe.net/assets/js/serviceworker-cache-polyfill.js');

const CACHE_VERSION = 19;
const CURRENT_CACHES = {
  prefetch: 'seoscribe-v' + CACHE_VERSION
};

self.addEventListener('install', event => {
  const urlsToPrefetch = [
    'https://seoscribe.net/editor/',
    'https://seoscribe.net/assets/js/editor.js',
    'https://seoscribe.net/assets/js/serviceworker-cache-polyfill.js',
    'https://seoscribe.net/favicon.ico',
    'https://seoscribe.net/manifest.json'
  ];

  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CURRENT_CACHES.prefetch).then(cache => {
      return cache.addAll(urlsToPrefetch);
    })
  );
});

self.addEventListener('activate', event => {
  const expectedCacheNames = Object.keys(CURRENT_CACHES).map(key => {
    return CURRENT_CACHES[key];
  });
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (expectedCacheNames.indexOf(cacheName) === -1){
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request.url)
        .catch(() => {
          return caches.match('/offline/');
        })
    );
  }
  else{
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});
