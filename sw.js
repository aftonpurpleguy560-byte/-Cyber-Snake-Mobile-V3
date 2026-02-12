const CACHE_NAME = 'cybersnake-v4-cache';
const ASSETS = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/snake_sprites.png',
  '/icon_large.png',
  '/manifest.json'
];

// Dosyaları önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Çevrimdışı çalışma motoru
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Bildirimler için arka plan desteği
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
