// sw.js — Service Worker Konektem (PWA Offline)
const CACHE = 'konektem-v3';
const OFFLINE_URLS = ['/app.html', '/index.html', '/manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Only cache GET requests to our own domain
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('netlify/functions')) return;
  if (e.request.url.includes('supabase')) return;
  if (e.request.url.includes('imagekit')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache les fichiers HTML/CSS/JS/fonts
        if (response.ok && (
          e.request.url.endsWith('.html') ||
          e.request.url.endsWith('.css') ||
          e.request.url.endsWith('.js') ||
          e.request.url.includes('fonts.googleapis') ||
          e.request.url.includes('fonts.gstatic')
        )) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache){
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback
        return caches.match('/app.html');
      });
    })
  );
});
