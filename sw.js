const CACHE_NAME = 'vcard-v1';
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([
      '/',
      '/index.html',
      '/edit.html',
      '/css/style.css',
      '/css/themes.css',
      '/js/viewer.js',
      '/js/editor.js',
      '/js/firebase-config.js'
    ]))
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});