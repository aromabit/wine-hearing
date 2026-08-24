const CACHE_NAME = "wine-hearing-v1"
const BASE = new URL(self.registration.scope).pathname

const PRECACHE_URLS = [BASE, `${BASE}icon-192.png`, `${BASE}icon-512.png`]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  if (!request.url.startsWith(self.location.origin)) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(() =>
        caches
          .match(request)
          .then(
            (cached) =>
              cached ??
              (request.mode === "navigate" ? caches.match(BASE) : undefined)
          )
      )
  )
})
