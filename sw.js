// Croatia Investments — Service Worker
// Version bump here to force cache refresh
const CACHE_VERSION = 'ci-v1';
const CACHE_NAME = `croatia-investments-${CACHE_VERSION}`;

// Pages and assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/projects.html',
  '/about.html',
  '/contact.html',
  '/sellers.html',
  '/terms.html',
  '/privacy.html',
  '/gdpr.html',
  '/manifest.json'
];

// ─── Install: pre-cache core pages ───────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: delete old caches ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: Network-first for HTML, Cache-first for assets ───────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // HTML pages: Network-first (always try fresh, fallback to cache)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Other assets (CSS, JS, fonts, images): Cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
