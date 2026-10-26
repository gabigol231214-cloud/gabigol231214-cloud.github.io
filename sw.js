// Service worker do Multi-Retro: guarda o site no aparelho para funcionar sem internet.
// Quando há conexão, busca a versão mais nova e atualiza o cache; sem conexão, usa o que está guardado.
const CACHE = 'multi-retro-v2';
const SHELL = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  './nes.png', './gameboy.png', './atari2600.png', './chip8.png', './megadrive.png', './gamegear.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
