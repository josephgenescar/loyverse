// Konektem Service Worker v1777421194
var CACHE_NAME = 'konektem-v1778101558';
var STATIC_FILES = ['/', '/index.html', '/app.html', '/app.js', '/manifest.json', '/app.js',
  '/status.html'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(function(c){ return c.addAll(STATIC_FILES).catch(function(){}); }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE_NAME) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('message', function(event) {
  if(!event.data || event.data.type !== 'STOCK_ALERT') return;
  var epuise = event.data.epuise || [];
  var bas = event.data.bas || [];
  var body = '';
  if(epuise.length) body += '🔴 ÉPUISÉ: ' + epuise.slice(0,3).join(', ');
  if(bas.length) body += (body?'\n':'') + '🟡 Stock bas: ' + bas.slice(0,3).join(', ');
  if(!body) return;
  self.registration.showNotification('⚠️ Konektem — Alèt Stock', {
    body: body, tag: 'stock-alert', requireInteraction: true,
    actions: [{action:'open', title:'📦 Voir stocks'}, {action:'wa', title:'📲 WhatsApp'}]
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if(event.action === 'wa') { event.waitUntil(clients.openWindow('https://wa.me/50948868964')); return; }
  event.waitUntil(clients.matchAll({type:'window'}).then(function(list){
    for(var i=0;i<list.length;i++){ if(list[i].url.includes('app.html')){ list[i].focus(); return; } }
    return clients.openWindow('/app.html');
  }));
});

self.addEventListener('fetch', function(event) {
  if(event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(function(r){
    if(r && r.status===200){ var c=r.clone(); caches.open(CACHE_NAME).then(function(cache){cache.put(event.request,c);}); }
    return r;
  }).catch(function(){ return caches.match(event.request); }));
});
