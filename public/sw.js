const CACHE_NAME = 'virtual-building-empire-v2.1.0';
const STATIC_CACHE = 'static-v2.1.0';
const DYNAMIC_CACHE = 'dynamic-v2.1.0';
const IMAGE_CACHE = 'images-v2.1.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/badge-72.png',
  '/offline.html'
];

// Game-specific assets
const GAME_ASSETS = [
  '/characters/',
  '/buildings/',
  '/sounds/',
  '/fonts/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching game assets');
        return cache.addAll(['/']);
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content and implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Different strategies for different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first with cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    // Images - Cache first with network fallback
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (url.pathname.match(/\.(js|css|woff|woff2|ttf)$/)) {
    // Static assets - Cache first
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    // HTML pages - Stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache first strategy for static assets
async function cacheFirstStrategy(request, cacheName = CACHE_NAME) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch resource:', request.url);
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse || caches.match('/offline.html');
  });
  
  return cachedResponse || fetchPromise;
}

// Background sync for game data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-game-data') {
    event.waitUntil(syncGameData());
  } else if (event.tag === 'background-earnings-collection') {
    event.waitUntil(syncEarningsCollection());
  }
});

// Sync game data in background
async function syncGameData() {
  try {
    console.log('Service Worker: Syncing game data...');
    
    // Get stored game state
    const gameState = await getStoredGameState();
    
    if (gameState) {
      // Send to server
      await fetch('/api/sync-game-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameState),
      });
      
      console.log('Service Worker: Game data synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync game data:', error);
    throw error;
  }
}

// Sync earnings collection
async function syncEarningsCollection() {
  try {
    console.log('Service Worker: Collecting earnings in background...');
    
    const response = await fetch('/api/collect-earnings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Show notification about collected earnings
      if (data.amount > 0) {
        self.registration.showNotification('💰 Earnings Collected!', {
          body: `You earned ${data.amount.toFixed(2)} LUNC while away!`,
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          tag: 'earnings-collected',
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Game',
              icon: '/icons/view-icon.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ],
          data: {
            amount: data.amount,
            type: 'earnings'
          }
        });
      }
    }
  } catch (error) {
    console.error('Service Worker: Failed to collect earnings:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: 'Virtual Building Empire', body: event.data.text() };
    }
  }
  
  const options = {
    body: data.body || 'New update available!',
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag || 'general',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'view',
        title: 'View Game'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: data
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Virtual Building Empire', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    // Open the game
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If game is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'collect' && event.notification.data?.type === 'earnings') {
    // Handle earnings collection
    event.waitUntil(
      fetch('/api/collect-earnings', { method: 'POST' })
        .then(() => {
          return self.registration.showNotification('✅ Earnings Collected!', {
            body: 'Your earnings have been collected successfully.',
            icon: '/icons/icon-192.png',
            tag: 'earnings-success'
          });
        })
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_GAME_STATE') {
    storeGameState(event.data.gameState);
  } else if (event.data && event.data.type === 'SCHEDULE_EARNINGS_COLLECTION') {
    scheduleEarningsCollection(event.data.interval);
  }
});

// Store game state for offline access
async function storeGameState(gameState) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(gameState), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put('game-state', response);
    console.log('Service Worker: Game state cached');
  } catch (error) {
    console.error('Service Worker: Failed to cache game state:', error);
  }
}

// Get stored game state
async function getStoredGameState() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await cache.match('game-state');
    
    if (response) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Service Worker: Failed to get stored game state:', error);
    return null;
  }
}

// Schedule periodic earnings collection
function scheduleEarningsCollection(interval = 300000) { // 5 minutes default
  console.log('Service Worker: Scheduling earnings collection every', interval, 'ms');
  
  // Use setTimeout for periodic collection
  setTimeout(() => {
    self.registration.sync.register('background-earnings-collection')
      .then(() => {
        console.log('Service Worker: Earnings collection scheduled');
        // Schedule next collection
        scheduleEarningsCollection(interval);
      })
      .catch((error) => {
        console.error('Service Worker: Failed to schedule earnings collection:', error);
      });
  }, interval);
}

// Periodic background tasks
setInterval(() => {
  // Cleanup old cache entries
  cleanupOldCacheEntries();
  
  // Check for app updates
  checkForAppUpdates();
}, 600000); // Every 10 minutes

// Cleanup old cache entries
async function cleanupOldCacheEntries() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (now - responseDate > maxAge) {
            await cache.delete(request);
            console.log('Service Worker: Cleaned up old cache entry:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Cache cleanup failed:', error);
  }
}

// Check for app updates
async function checkForAppUpdates() {
  try {
    const response = await fetch('/api/version');
    if (response.ok) {
      const { version } = await response.json();
      const currentVersion = '2.1.0'; // This should be dynamic
      
      if (version !== currentVersion) {
        console.log('Service Worker: New version available:', version);
        
        // Notify about update
        self.registration.showNotification('🚀 Update Available!', {
          body: `Version ${version} is now available. Click to update.`,
          icon: '/icons/icon-192.png',
          tag: 'app-update',
          requireInteraction: true,
          actions: [
            {
              action: 'update',
              title: 'Update Now'
            },
            {
              action: 'later',
              title: 'Later'
            }
          ],
          data: { type: 'update', version }
        });
      }
    }
  } catch (error) {
    console.log('Service Worker: Update check failed:', error);
  }
}

console.log('Service Worker: Script loaded successfully');
