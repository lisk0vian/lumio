// Lumio service worker: hace que la recarga vaya más rápida sirviendo el
// app shell y los assets desde la caché del navegador.
//
// Estrategia:
// - Navegaciones ({base}, {base}en/, {base}calculo, {base}en/calculation):
//   stale-while-revalidate.
//   La primera recarga responde al instante desde caché y actualiza la copia
//   en segundo plano, así un despliegue nuevo nunca deja HTML viejo.
// - Assets mismos-origen (_astro/*.js|css, woff2, svg, ico): cache-first.
//   Astro los emite con hash en el nombre, así que son inmutables y seguros
//   de cachear de por vida dentro de esta versión del SW.
// - Todo lo demás: red con respaldo a caché.
//
// Al cambiar la lógica de este archivo, subir CACHE a `lumio-v2`, `lumio-v3`…
// El evento `activate` borra las versiones viejas. Los assets con hash nuevo
// no necesitan bump: entran solos por su URL nueva.

const CACHE = 'lumio-v1'
// Base-aware: el SW se sirve en /sw.js en dev y en /lumio/sw.js en Pages.
// Derivar el base del propio URL evita hardcodear el nombre del repo y
// mantiene localhost funcionando sin cambios.
const BASE = new URL('./', self.location.href).pathname
const PRECACHE = [BASE, `${BASE}en/`]
const RUNTIME_LIMIT = 200

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('lumio-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

function isStaticAsset(url) {
  return (
    url.pathname.startsWith(`${BASE}_astro/`) ||
    url.pathname === `${BASE}sw.js` ||
    /\.(js|css|woff2?|ico|svg|avif|webp|png)$/.test(url.pathname)
  )
}

async function trimCache() {
  const cache = await caches.open(CACHE)
  const keys = await cache.keys()
  if (keys.length > RUNTIME_LIMIT) {
    await cache.delete(keys[0])
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response && response.ok) {
    const copy = response.clone()
    eventlessPut(request, copy)
  }
  return response
}

async function eventlessPut(request, response) {
  const cache = await caches.open(CACHE)
  await cache.put(request, response)
  trimCache().catch(() => {})
}

// Navegación: responde al instante con la caché y revalida en segundo plano.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {})
      }
      return response
    })
    .catch(() => cached)
  return cached || network
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request))
  }
})
