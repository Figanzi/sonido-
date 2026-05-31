/* ============================================================
   Figanzi Sonidos — sw.js (Service Worker)
   Estrategia: Cache First para assets estáticos,
               Network First para navegación.
   ============================================================ */

const CACHE_NAME = 'figanzi-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
];

/* ── INSTALL: pre-cachear assets esenciales ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando assets esenciales');
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

/* ── ACTIVATE: limpiar caches viejas ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Eliminando cache vieja:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

/* ── FETCH: Network First para HTML, Cache First para el resto ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar requests del mismo origen
  if (url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    // Navegación: intentar red, fallback a cache
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/index.html')))
    );
  } else {
    // Assets: Cache First
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
  }
});
