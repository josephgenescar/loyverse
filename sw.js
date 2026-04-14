// Konektem Service Worker v4.0 — PWA Offline konplè
var CACHE_NAME = 'konektem-v1776174297';
var STATIC_URLS = [
  '/',
  '/index.html',
  '/app.html',
  '/manifest.json',
  '/payment-return.html'
];

// ── INSTALL: pre-cache tout fichye estatik yo ──
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(STATIC_URLS).catch(function(err){
        console.log('[SW] Cache install partial error:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: retire ansyen cache yo ──
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// ── FETCH: Estrateji Cache-First pou HTML/JS/CSS, Network-First pou API ──
self.addEventListener('fetch', function(e){
  var url = e.request.url;

  // Ignora: Netlify Functions, Supabase, MonCash, ImageKit
  if(url.includes('netlify/functions') ||
     url.includes('supabase.co') ||
     url.includes('moncash') ||
     url.includes('imagekit.io') ||
     url.includes('googleapis.com') ||
     e.request.method !== 'GET'){
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(cached){
      // Cache-first pou fichye lokal
      if(cached) return cached;

      return fetch(e.request).then(function(response){
        if(!response || !response.ok) return response;

        // Cache sèlman HTML, JS, CSS, fonts
        var ct = response.headers.get('content-type') || '';
        if(ct.includes('html') || ct.includes('javascript') ||
           ct.includes('css') || ct.includes('font')){
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function(){
        // Offline fallback
        if(e.request.destination === 'document'){
          return caches.match('/app.html');
        }
      });
    })
  );
});
