
/* Purpleguy © 2026 - tablet power */
const CACHE_NAME = 'cyber-snake-v3.8-cache';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/translations.js',
  '/404.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

