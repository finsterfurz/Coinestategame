// ===================================
// 🛠️ SERVICE WORKER - VIRTUAL BUILDING EMPIRE
// ===================================

const CACHE_NAME = 'virtual-building-empire-v2.0.0';
const API_CACHE_NAME = 'vbe-api-cache-v1';

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/characters',
  '/api/marketplace',
  '/api/building',
  '/api/stats'
];

// ===================================
// INSTALL EVENT
// ===================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached');
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
});

// ===================================
// ACTIVATE EVENT
// ===================================
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        self.clients.claim();
      })
  );
});

// ===================================
// FETCH EVENT
// ===================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - Cache First strategy
    if (isStaticAsset(url)) {
      event.respondWith(cacheFirst(request));
    }
    // API requests - Network First strategy
    else if (isAPIRequest(url)) {
      event.respondWith(networkFirst(request));
    }
    // Web3 requests - Network Only
    else if (isWeb3Request(url)) {
      event.respondWith(networkOnly(request));
    }
    // HTML pages - Network First with fallback
    else if (isHTMLRequest(request)) {
      event.respondWith(networkFirstWithFallback(request));
    }
    // Other requests - Network First
    else {
      event.respondWith(networkFirst(request));
    }
  }
});

// ===================================
// CACHING STRATEGIES
// ===================================

// Cache First - Good for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

// Network First - Good for dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Network and cache failed', { status: 503 });
  }
}

// Network Only - For Web3 requests
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Network only failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

// Network First with HTML fallback
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache fallback');
    
    // Try to return cached index.html for SPA routing
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline - Please check your connection', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// ===================================
// HELPER FUNCTIONS
// ===================================

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/static/') ||
    url.pathname.includes('.js') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.png') ||
    url.pathname.includes('.jpg') ||
    url.pathname.includes('.ico') ||
    url.pathname.includes('.svg')
  );
}

function isAPIRequest(url) {
  return (
    url.pathname.startsWith('/api/') ||
    API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))
  );
}

function isWeb3Request(url) {
  return (
    url.hostname.includes('infura.io') ||
    url.hostname.includes('alchemy.com') ||
    url.hostname.includes('polygon-rpc.com') ||
    url.hostname.includes('bscrpc.com') ||
    url.pathname.includes('/web3') ||
    url.pathname.includes('/ethereum') ||
    url.pathname.includes('/metamask')
  );
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// ===================================
// MESSAGE HANDLING
// ===================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Skipping waiting...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ Clearing all caches...');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('✅ All caches cleared');
      event.ports[0].postMessage({ success: true });
    });
  }
});

// ===================================
// BACKGROUND SYNC (Future Enhancement)
// ===================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'character-mint') {
    event.waitUntil(syncCharacterMint());
  }
  
  if (event.tag === 'lunc-collection') {
    event.waitUntil(syncLuncCollection());
  }
});

async function syncCharacterMint() {
  console.log('🔄 Syncing character mint...');
  // Implementation for offline character minting sync
}

async function syncLuncCollection() {
  console.log('🔄 Syncing LUNC collection...');
  // Implementation for offline LUNC collection sync
}

// ===================================
// PUSH NOTIFICATIONS (Future Enhancement)
// ===================================
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: data.tag || 'vbe-notification',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Virtual Building Empire', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('https://virtualbuilding.game')
  );
});

console.log('🎮 Virtual Building Empire Service Worker loaded');