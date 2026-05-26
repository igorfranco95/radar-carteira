const CACHE = 'radar-v1';
const STATIC = ['./','./index.html','./icon.svg','./manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  // radar.json: sempre busca da rede (dados frescos), cache como fallback
  if (e.request.url.includes('radar.json')) {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Demais assets: cache first
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(r => {
        const c = r.clone();
        caches.open(CACHE).then(ca => ca.put(e.request, c));
        return r;
      })
    )
  );
});
