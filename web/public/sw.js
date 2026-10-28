const CACHE_NAME = 'agrisense-v2'

const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/models/classifier/model.json',
  '/models/classifier/group1-shard1of2.bin',
  '/models/classifier/group1-shard2of2.bin',
  '/models/severity/model.json',
  ...Array.from({ length: 6 }, (_, i) => `/models/severity/group1-shard${i + 1}of6.bin`),
]

const CACHE_FIRST_PATTERNS = [/^\/models\//, /^\/_next\/static\//, /^\/icons\//]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (event.request.method !== 'GET') return

  const isCacheFirst = CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))

  if (isCacheFirst) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          const clone = response.clone()
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          )
          return response
        })
      })
    )
  } else {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          )
          return response
        })
        .catch(async () => {
          const cached = await caches.match(event.request)
          if (cached) return cached
          return new Response('You are offline and this page has not been cached yet.', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain' },
          })
        })
    )
  }
})