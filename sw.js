// sw.js — Service Worker für OptixTweak Demo (Offline-Cache).
// Grundlegende Cache-Strategie: precache für statische Assets, cache-first mit Netzwerk-Fallback.
// HINWEIS: Für GitHub Pages funktioniert der SW nur bei https (oder localhost).

'use strict';

const CACHE = 'optixtweak-v1';
const PRECACHE_URLS = [
  '/',
  '/demo/public/index.html',
  '/demo/public/products.html',
  '/demo/public/faq.html',
  '/demo/public/downloads.html',
  '/demo/public/support.html',
  '/demo/public/impressum.html',
  '/demo/public/datenschutz.html',
  '/demo/public/privacy.html',
  '/demo/checkout/cart.html',
  '/demo/checkout/checkout.html',
  '/data/products.json',
  '/src/styles/_variables.css',
  '/src/js/escape.js',
  '/src/js/cart.js',
  '/src/js/toast.js',
  '/src/js/nav.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => {
        // Nicht-destruktiv hinzufügen (nicht alle URLs müssen existieren)
        return Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if(req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if(cached) return cached;
      return fetch(req).then(res => {
        // Nur gleiche Origin + erfolgreiche Antworten cachen
        if(res && res.ok && req.url.startsWith(self.location.origin)){
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => {
        // Offline-Fallback: Navigation → index.html
        if(req.mode === 'navigate'){
          return caches.match('/demo/public/index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
