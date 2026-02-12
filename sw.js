/* Purpleguy © 2026 - tablet power */
const CACHE_NAME = 'cybersnake-v4.1-cache';
const ASSETS = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/snake_sprites.png',
  '/icon_large.png',
  '/manifest.json'
];

// Dosyaları önbelleğe al (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Bazı dosyalar yoksa bile hataya düşmemesi için tek tek ekleme yapılabilir
      // Ama şu an ASSETS listesi tam.
      return cache.addAll(ASSETS);
    })
  );
});

// Eski önbellekleri temizle (Activate)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Çevrimdışı çalışma motoru (Fetch)
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
