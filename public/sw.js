/**
 * Service Worker for Emploi+ PWA
 * public/sw.js
 * 
 * Stratégies de caching:
 * - Assets statiques (JS, CSS, images): Cache-first
 * - Requêtes API: Network-first
 * - HTML: Network-first
 */

const CACHE_NAME = 'emploi-plus-v1';
const ASSET_CACHE = 'emploi-plus-assets-v1';
const API_CACHE = 'emploi-plus-api-v1';

// Assets à pré-cacher au install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Événement: Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('✅ Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
    ]).then(() => {
      console.log('✅ Service Worker installed');
      // Forcer l'activation immédiate
      self.skipWaiting();
    })
  );
});

// Événement: Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== ASSET_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Prendre le contrôle immédiatement
  self.clients.claim();
});

// Événement: Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes chrome-extension, etc.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Stratégie pour les APIs
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(networkFirstStrategy(request, API_CACHE));
  }

  // Stratégie pour les assets statiques
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    return event.respondWith(cacheFirstStrategy(request, ASSET_CACHE));
  }

  // Stratégie par défaut pour HTML, etc.
  event.respondWith(networkFirstStrategy(request, CACHE_NAME));
});

/**
 * Cache-First Strategy
 * 1. Chercher dans le cache
 * 2. Si pas trouvé, fetcher du network
 * 3. Mettre en cache et retourner
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      console.log(`✅ Cache hit: ${request.url}`);
      return cached;
    }

    const response = await fetch(request);

    // Ne cacher que les réponses 200
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('Cache-first error:', error);

    // Retourner une réponse offline si disponible
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Fallback offline
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network-First Strategy
 * 1. Chercher du network
 * 2. Si succès, mettre en cache et retourner
 * 3. Si erreur, retourner du cache
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);

    // Ne cacher que les réponses 200
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('Network-first error:', error);

    // Retourner du cache
    const cached = await caches.match(request);
    if (cached) {
      console.log(`✅ Fallback to cache: ${request.url}`);
      return cached;
    }

    // Pas de cache disponible
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Messages du client (App)
 */
self.addEventListener('message', (event) => {
  console.log('Message from client:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(cacheNames.map((name) => caches.delete(name)));
    });
  }
});

// Garder le Service Worker actif
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }
});
