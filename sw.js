const CACHE = 'raices-app-v13';
const APP_SHELL = [
  './app-raices.html',
  './zona-adulta.html',
  './mente-en-raices.html',
  './juegos-ludicos.html',
  './activacion-mental.html',
  './juegos-lectoescritura.html',
  './pintar-mandalas.html',
  './gimnasia-cerebral.html',
  './matematicas-raices.html',
  './aventuras-quenal.html',
  './cuerpo-raices.html',
  './mindfulness-ninos.html',
  './biblioteca-sonora.html',
  './informe-familiar.html',
  './assets/app-raices.css',
  './assets/app-raices.js',
  './assets/zona-adulta.css',
  './assets/planes-raices.css',
  './assets/zona-adulta.js',
  './assets/styles.css',
  './assets/mente-raices-v2.css',
  './assets/juegos-colecciones.css',
  './assets/site.js',
  './assets/mente-raices-v2.js',
  './assets/juegos-colecciones.js',
  './assets/mandalas-color.js',
  './assets/gimnasia-cerebral.css',
  './assets/gimnasia-cerebral.js',
  './assets/matematicas-raices.css',
  './assets/matematicas-raices.js',
  './assets/pedagogia-raices.js',
  './assets/motor-pedagogico.js',
  './assets/aventuras-quenal.css',
  './assets/aventuras-quenal.js',
  './assets/aventuras-quenal-adaptativo.js',
  './assets/aventuras-adaptativo.css',
  './assets/cuerpo-raices.css',
  './assets/cuerpo-raices.js',
  './assets/mindfulness-ninos.css',
  './assets/mindfulness-ninos.js',
  './assets/biblioteca-sonora.css',
  './assets/biblioteca-sonora.js',
  './assets/biblioteca-sonora/catalogo-publico-v1.json',
  './assets/biblioteca-sonora/catalogo-protegido-v1.json',
  './assets/experiencias-polish.css',
  './assets/access-dialog.css',
  './assets/informe-familiar.css',
  './assets/informe-familiar.js',
  './assets/gym-piezas-raices-sprite.png',
  './assets/personaje-quenal-v2.webp',
  './assets/quenual-ilustrado.webp',
  './assets/historia-queni-amigos.webp',
  './assets/ilustraciones-raices/aventura-semilla-01-v2.webp',
  './assets/ilustraciones-raices/aventura-semilla-02-v2.webp',
  './assets/ilustraciones-raices/aventura-semilla-03-v2.webp',
  './assets/ilustraciones-raices/aventura-caballos-01-v1.webp',
  './assets/ilustraciones-raices/aventura-caballos-02-v1.webp',
  './assets/ilustraciones-raices/aventura-caballos-03-v1.webp',
  './assets/ilustraciones-raices/aventura-caballos-04-v1.webp',
  './assets/ilustraciones-raices/aventura-caballos-05-v1.webp',
  './assets/ilustraciones-raices/aventura-caballos-06-v1.webp',
  './assets/ilustraciones-raices/aventura-caballos-07-v1.webp',
  './assets/ilustraciones-raices/aventura-cohetes-01-v1.webp',
  './assets/ilustraciones-raices/aventura-cohetes-02-v1.webp',
  './assets/ilustraciones-raices/aventura-cohetes-03-v1.webp',
  './assets/ilustraciones-raices/aventura-cohetes-04-v1.webp',
  './assets/ilustraciones-raices/aventura-cohetes-05-v1.webp',
  './assets/ilustraciones-raices/aventura-cohetes-06-v1.webp',
  './assets/ilustraciones-raices/aventura-cohetes-07-v1.webp',
  './assets/ilustraciones-raices/aventura-estrellas-01-v1.webp',
  './assets/ilustraciones-raices/aventura-estrellas-02-v1.webp',
  './assets/ilustraciones-raices/aventura-estrellas-03-v1.webp',
  './assets/ilustraciones-raices/aventura-estrellas-04-v1.webp',
  './assets/ilustraciones-raices/aventura-estrellas-05-v1.webp',
  './assets/ilustraciones-raices/aventura-estrellas-06-v1.webp',
  './assets/ilustraciones-raices/aventura-estrellas-07-v1.webp',
  './assets/ilustraciones-raices/cuerpo-01-v2.webp',
  './assets/ilustraciones-raices/cuerpo-02-v2.webp',
  './assets/ilustraciones-raices/cuerpo-03-v2.webp',
  './assets/ilustraciones-raices/cuerpo-04-v2.webp',
  './assets/ilustraciones-raices/cuerpo-05-v2.webp',
  './assets/ilustraciones-raices/cuerpo-06-v2.webp',
  './assets/ilustraciones-raices/calma-01-v2.webp',
  './assets/ilustraciones-raices/calma-02-v2.webp',
  './assets/ilustraciones-raices/calma-03-v2.webp',
  './assets/ilustraciones-raices/calma-04-v2.webp',
  './assets/ilustraciones-raices/calma-05-v2.webp',
  './assets/ilustraciones-raices/calma-06-v2.webp',
  './assets/biblioteca-sonora/a01-v1.webp',
  './assets/biblioteca-sonora/a02-v1.webp',
  './assets/biblioteca-sonora/a03-v1.webp',
  './assets/biblioteca-sonora/a04-v1.webp',
  './assets/biblioteca-sonora/a05-v1.webp',
  './assets/biblioteca-sonora/a06-v1.webp',
  './assets/biblioteca-sonora/a07-v1.webp',
  './assets/biblioteca-sonora/f01-v1.webp',
  './assets/biblioteca-sonora/f02-v1.webp',
  './assets/biblioteca-sonora/n01-v1.webp',
  './assets/biblioteca-sonora/n02-v1.webp',
  './assets/biblioteca-sonora/j01-v1.webp',
  './assets/biblioteca-sonora/j02-v1.webp',
  './assets/biblioteca-sonora/p01-v1.webp',
  './assets/biblioteca-sonora/p02-v1.webp',
  './assets/biblioteca-sonora/p03-v1.webp',
  './assets/isotipo-raices.webp',
  './assets/app-icons/app-icon-192.png',
  './assets/app-icons/app-icon-512.png',
  './assets/mandalas/quenal-quenual-coloring-overlay.png',
  './assets/mandalas/quenal-llama-coloring-overlay.png',
  './assets/mandalas/quenal-condor-coloring-overlay.png',
  './assets/mandalas/quenal-calma-coloring-overlay.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('raices-app-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
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
