const CACHE_NAME = "ciyu-huacai-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./shuffle-bag.js",
  "./word-selection.js",
  "./app.js",
  "./manifest.webmanifest",
  "./data/words.json",
  "./data/imagenet-words.json",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS.map(url => new Request(url, { cache: "reload" })))));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith("ciyu-huacai-") && key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// 联网时优先取最新文件并更新缓存，离线时退回缓存
self.addEventListener("fetch", event => {
  const request = event.request;
  // Do not intercept other Micro.blog resources or cross-origin requests.
  if (request.method !== "GET" || !request.url.startsWith(self.registration.scope)) return;

  event.respondWith(
    fetch(request, { cache: "no-cache" })
      .then(response => {
        if (response.ok) {
          // Keep the service worker alive until the successful response is cached.
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy))
              .catch(() => {}) // Quota/storage errors must not disrupt online play.
          );
        }
        return response;
      })
      .catch(async () => (await caches.match(request)) || Response.error())
  );
});
