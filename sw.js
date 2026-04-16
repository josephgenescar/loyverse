// Konektem Service Worker v1776370291
var CACHE_NAME = 'konektem-v1776370291';
var STATIC_FILES = ['/', '/index.html', '/app.html', '/app.js', '/manifest.json'];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_FILES).catch(function(){});
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if(key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

// Resevwa mesaj STOCK_ALERT depi app la
self.addEventListener('message', function(event) {
  if(!event.data || event.data.type !== 'STOCK_ALERT') return;
  
  var epuise = event.data.epuise || [];
  var bas    = event.data.bas    || [];
  
  var title = '⚠️ Konektem — Alèt Stock';
  var body  = '';
  
  if(epuise.length) body += '🔴 ÉPUISÉ: ' + epuise.slice(0,3).join(', ') + (epuise.length>3?' +'+( epuise.length-3)+' autres':'');
  if(bas.length)    body += (body ? '\n' : '') + '🟡 Stock bas: ' + bas.slice(0,3).join(', ');
  
  if(!body) return;
  
  self.registration.showNotification(title, {
    body:    body,
    icon:    '/manifest-icon.png',
    badge:   '/manifest-icon.png',
    tag:     'stock-alert',
    requireInteraction: true,
    actions: [
      { action: 'open', title: '📦 Voir stocks' },
      { action: 'wa',   title: '📲 WhatsApp' }
    ]
  });
});

// Klike sou notifikasyon
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if(event.action === 'wa') {
    event.waitUntil(clients.openWindow('https://wa.me/50948868964'));
    return;
  }
  
  event.waitUntil(
    clients.matchAll({type:'window'}).then(function(clientList) {
      for(var i=0; i<clientList.length; i++) {
        if(clientList[i].url.includes('app.html')) {
          clientList[i].focus();
          return;
        }
      }
      return clients.openWindow('/app.html');
    })
  );
});

// Network first
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
