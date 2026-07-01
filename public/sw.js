const CACHE_NAME = "love-story-cache-v4";
const ASSETS_TO_CACHE = [
  "/index.html",
  "/story.html",
  "/timeline.html",
  "/gallery.html",
  "/letters.html",
  "/appreciation.html",
  "/styles.css",
  "/script.js",
  "/appreciation-script.js",
  "/auth.js",
  "/firebase-config.js",
  "/login.js",
  "/letters-sync.js",
  "/manifest.json",
  "/icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Network first for external resources (fonts, CDN)
  if (url.origin !== location.origin || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Cache first for local assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
