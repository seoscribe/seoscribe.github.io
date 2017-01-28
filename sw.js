'use strict';

const CACHE_VERSION = 16;
const CURRENT_CACHES = { prefetch: 'seoscribe-v' + CACHE_VERSION };

self.addEventListener('install', event => {
  const urlsToPrefetch = [
    'https://seoscribe.net/',
    'https://seoscribe.net/assets/css/main.css',
    'https://seoscribe.net/assets/js/event-listener-options.shim.js',
    'https://seoscribe.net/assets/js/main.js',
    'https://seoscribe.net/editor/',
    'https://seoscribe.net/editor/editor.js',
    'https://seoscribe.net/editor/editor-worker.js',
    'https://seoscribe.net/manifest.json',
    'https://seoscribe.net/assets/vid/perf.webm',
    'https://seoscribe.net/assets/vid/perf.mp4',
    'https://seoscribe.net/assets/img/perf.gif',
    'https://seoscribe.net/assets/img/perf.jpg',
    'https://seoscribe.net/favicon.ico',
    'https://fonts.googleapis.com/css?family=Karla:400,700&amp;subset=latin-ext',
    'https://fonts.gstatic.com/s/karla/v5/suoMYBGv5sGCUIrF9mVTffesZW2xOQ-xsNqO47m55DA.woff2',
    'https://fonts.gstatic.com/s/karla/v5/Zi_e6rBgGqv33BWF8WTq8g.woff2',
    'https://fonts.gstatic.com/s/robotomono/v4/hMqPNLsu_dywMa4C_DEpY44P5ICox8Kq3LLUNMylGO4.woff2',
    'https://cdn.rawgit.com/wnda/stabs/master/stabs.js',
    'https://cdn.rawgit.com/wnda/toad/master/toad.js',
    'https://cdn.polyfill.io/v2/polyfill.js?features=querySelector,localStorage,Array.prototype.forEach,Array.prototype.indexOf,Array.prototype.filter,Array.prototype.map,Array.prototype.reduce,Element.prototype.classList,XMLHttpRequest,requestAnimationFrame',
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
  switch (true) {
    case !!(event.request.url.includes('editor')):
    case !(event.request.mode === 'navigate'):
    case !(event.request.method === 'GET' && event.request.headers.get('accept').indexOf('text/html') > -1):
      return event.respondWith(self.caches.match(event.request).then(response => { return response || self.fetch(event.request);}));
    default:
      event.respondWith(fetch(event.request.url).catch(err => {return caches.match('/offline/');}));
  }
});
