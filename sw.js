const CACHE_NAME = '87fm-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  // Não armazena em cache o fluxo contínuo de áudio nem APIs de streaming
  if (e.request.url.includes('stream') || e.request.url.includes('proxy') || e.request.url.includes('api')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
