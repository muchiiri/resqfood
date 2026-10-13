// ResQfood service worker. It does one job: when a page load fails because there is no connection, it shows the
// stored offline page. It stores only the two files below, once, when it installs. It never stores any other
// response (no pages, no data, no scripts), and it never touches any request that is not a page load, so signed-in
// content is always fetched fresh from the network.

const CACHE = "resqfood-offline-v1";
const OFFLINE_URL = "/offline.html";
const ICON_URL = "/icons/icon-192.png";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, ICON_URL]))
      .then(() => self.skipWaiting()),
  );
});

// Remove caches left by any other version of this worker.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Only GET page loads are handled, and only to answer a failed network request. Everything else (server actions,
// Supabase calls, images, scripts, styles) is left alone with no respondWith, so the browser handles it normally.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(OFFLINE_URL)) || Response.error();
    }),
  );
});
