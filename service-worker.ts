/// <reference lib="webworker" />

/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also import specific Workbox modules if using a bundler.

const CACHE_NAME = 'localnotes-cache-v1';
// Changed to relative paths to support GitHub Pages subdirectories
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // We assume the build process will include the main bundle here.
  // In a real setup, Workbox injects the manifest.
  // For this standalone example, we cache broadly.
];

// Install: Cache core assets
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event: any) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// Fetch: Stale-While-Revalidate strategy for most things
self.addEventListener('fetch', (event: any) => {
  // Skip cross-origin requests like analytics/etc if strictly local,
  // but we do want to cache the Tailwind CDN if possible.
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          // If it's a CDN (cors) or basic, we might want to cache it
          // But strict 'basic' check fails for CDNs.
          // Let's relax for CDNs or just return response.
          if(response.type === 'opaque' || response.type === 'cors') {
             // allow caching CDNs
          } else {
             return response;
          }
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});