// Simple offline cache so the site opens even with a weak connection.
// It only handles pages and files from this site. It never touches Firebase
// (database and sign-in) traffic, and it never caches the owner page.
const CACHE = 'moksha-v5';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './images/logo-mark.svg', './images/wordmark-moksha.svg', './images/wordmark-blush-with.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;           // leave other sites (Firebase, fonts) alone
  if (url.pathname.endsWith('/admin.html') || url.pathname.endsWith('/db.js') || url.pathname.endsWith('/firebase-config.js')) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
