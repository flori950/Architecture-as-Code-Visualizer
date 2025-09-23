// Service Worker for caching optimized bundles
const CACHE_NAME = 'aac-visualizer-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/vite.svg',
  '/favicon.svg',
  '/manifest.json',
];

// Cache strategies for different asset types
const CACHE_STRATEGIES = {
  // Cache JavaScript and CSS bundles with versioning
  '/assets/': 'cache-first',
  '/js/': 'cache-first',
  // Cache example files
  '/examples/': 'cache-first',
  // Network first for API calls (if any)
  '/api/': 'network-first',
  // Default strategy
  default: 'network-first',
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Determine cache strategy
  let strategy = CACHE_STRATEGIES.default;
  for (const [path, cacheStrategy] of Object.entries(CACHE_STRATEGIES)) {
    if (path !== 'default' && url.pathname.startsWith(path)) {
      strategy = cacheStrategy;
      break;
    }
  }

  event.respondWith(handleRequest(event.request, strategy));
});

async function handleRequest(request, strategy) {
  const cache = await caches.open(CACHE_NAME);

  switch (strategy) {
    case 'cache-first':
      return cacheFirst(request, cache);
    case 'network-first':
      return networkFirst(request, cache);
    default:
      return networkFirst(request, cache);
  }
}

async function cacheFirst(request, cache) {
  try {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache', request.url);
      return cachedResponse;
    }

    const response = await fetch(request);
    if (response.status === 200) {
      console.log('Service Worker: Caching new resource', request.url);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Service Worker: Cache first strategy failed', error);
    // Return offline fallback if available
    return cache.match('/index.html');
  }
}

async function networkFirst(request, cache) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      console.log('Service Worker: Updating cache from network', request.url);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline fallback
    return cache.match('/index.html');
  }
}

// Handle background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any pending operations when back online
      console.log('Service Worker: Background sync triggered')
    );
  }
});

// Handle push notifications if needed in the future
self.addEventListener('push', event => {
  console.log('Service Worker: Push message received');
  // Future feature: Handle diagram processing notifications
});

// Cleanup old caches on version updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
