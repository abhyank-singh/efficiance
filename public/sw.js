// Efficiance service worker: makes the app installable and usable offline.
// Strategy: network-first for pages (so deploys show up), cache-first for hashed assets,
// stale-while-revalidate for fonts. /api/* is never cached (AI falls back to saved data offline).
const CACHE = 'efficiance-v3'
const PRECACHE = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/api/')) return
    if (req.mode === 'navigate') {
      e.respondWith(
        fetch(req).then((res) => { caches.open(CACHE).then((c) => c.put('/', res.clone())); return res })
          .catch(() => caches.match('/')),
      )
      return
    }
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()))
        return res
      })),
    )
    return
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(CACHE).then((c) => c.match(req).then((hit) => {
        const net = fetch(req).then((res) => { c.put(req, res.clone()); return res }).catch(() => hit)
        return hit || net
      })),
    )
  }
})
