const CACHE_NAME = "cyber-snake-v5.8";
const assets = ["/", "/index.html", "/style.css", "/script.js", "/translations.js", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(assets)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
