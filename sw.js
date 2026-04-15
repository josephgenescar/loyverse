// Konektem Service Worker v1776258938
var CACHE_NAME = 'konektem-v1776258938';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/app.html',
  '/app.js',
  '/manifest.json'
];

// Force update: retire tout vye cache
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_FILES).catch(function() {});
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if(key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Network first — toujou eseye network anvan cache
self.addEventListener('fetch', function(event) {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(function(response) {
      if(response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
