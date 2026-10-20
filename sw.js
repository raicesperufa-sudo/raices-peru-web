const CACHE = 'raices-app-v1';
const APP_SHELL = [
  './app-raices.html',
  './mente-en-raices.html',
  './juegos-ludicos.html',
  './activacion-mental.html',
  './juegos-lectoescritura.html',
  './pintar-mandalas.html',
  './assets/app-raices.css',
  './assets/app-raices.js',
  './assets/styles.css',
  './assets/mente-raices-v2.css',
  './assets/juegos-colecciones.css',
  './assets/site.js',
  './assets/mente-raices-v2.js',
  './assets/juegos-colecciones.js',
  './assets/mandalas-color.js',
  './assets/personaje-quenal-v2.webp',
  './assets/isotipo-raices.webp',
  './assets/app-icons/app-icon-192.png',
  './assets/app-icons/app-icon-512.png',
  './assets/mandalas/quenal-quenual-coloring-overlay.png',
  './assets/mandalas/quenal-llama-coloring-overlay.png',
  './assets/mandalas/quenal-condor-coloring-overlay.png',
  './assets/mandalas/quenal-calma-coloring-overlay.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('raices-app-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (request.destination === 'audio' || request.url.includes('/assets/audio/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); return response;
    }).catch(() => caches.match(request).then((cached) => cached || caches.match('./app-raices.html'))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (!response || response.status !== 200 || response.type === 'opaque') return response;
    const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); return response;
  })));
});
