// Guarda as páginas e imagens para o app abrir mesmo sem internet.
// Os vídeos são grandes e vêm sempre da internet.
const CACHE = 'stef-v12';
const FILES = ['./', 'index.html', 'i18n-en.js', 'manifest.json',
  ...['logo.png','icon-192.png','icon-512.png','apple-touch-icon.png','entrevista-capa.jpg','saude-comunitaria-capa.jpg'].map(f => 'img/' + f)];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/media/')) return;
  // Página: tenta a internet primeiro (para pegar atualizações); imagens: usa o que já está guardado.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  })));
});
