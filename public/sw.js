const CACHE_NAME = "love-story-cache-v7";
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
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png"
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
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Always go to network first for pages and app shell files so normal refresh
  // picks up newly deployed content without requiring a hard refresh.
  const isNavigation = event.request.mode === "navigate";
  const isAppShellFile =
    ["/", "/index.html", "/manifest.json", "/sw.js"].includes(url.pathname) ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".html");
  if (url.origin === location.origin && (isNavigation || isAppShellFile)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
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
  
  // Cache first for other local assets (images, etc.)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
