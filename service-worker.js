const CACHE_NAME = 'game-of-dots-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/ionic.app.min.css',
  '/js/app.js',
  '/js/_controller.js',
  '/js/_service.js',
  '/js/_directive.js',
  '/lib/ionic/js/ionic.bundle.js',
  '/sound/end.ogg',
  '/sound/tap.ogg',
  '/sound/points.ogg',
  '/sound/move.ogg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
