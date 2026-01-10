/**
 * Service Worker for Comic Reader PWA
 * Enables offline reading and caching strategy
 */

const CACHE_NAME = 'comic-reader-v1.0.0';
const API_CACHE_NAME = 'comic-reader-api-v1.0.0';
const IMAGE_CACHE_NAME = 'comic-reader-images-v1.0.0';

// Cache size limits
const MAX_IMAGE_CACHE_SIZE = 500 * 1024 * 1024; // 500 MB
const TRIM_TO_SIZE = 400 * 1024 * 1024; // Trim to 400 MB

// Files to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/read_now.svg',
  '/view_more.svg',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/home',
  '/api/danh-sach/truyen-moi',
  '/api/danh-sach/dang-phat-hanh',
  '/api/danh-sach/hoan-thanh',
  '/api/the-loai',
];

// Image patterns to cache
const IMAGE_PATTERNS = [
  /https:\/\/img\.otruyenapi\.com\/uploads\/comics\//,
  /https:\/\/img\.otruyenapi\.com\/uploads\/authors\//,
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request, event));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

/**
 * Trim the image cache to a specific size using an LRU-like strategy (oldest first).
 */
async function trimCache() {
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const requests = await cache.keys();
    
    if (requests.length === 0) return;

    // Create a list of cache entries with their size and date
    const cacheEntries = await Promise.all(
      requests.map(async (request) => {
        const response = await cache.match(request);
        if (!response) return null;
        
        const size = response.headers.get('content-length') || 0;
        const date = new Date(response.headers.get('date') || 0);
        
        return {
          url: request.url,
          size: Number(size),
          date: date,
        };
      })
    );

    // Filter out null entries and sort by date (oldest first)
    const validEntries = cacheEntries.filter(entry => entry !== null);
    validEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

    const totalSize = validEntries.reduce((sum, entry) => sum + entry.size, 0);

    if (totalSize > MAX_IMAGE_CACHE_SIZE) {
      console.log(`[SW] Cache size (${(totalSize / 1024 / 1024).toFixed(2)} MB) exceeds limit. Trimming...`);
      let currentSize = totalSize;
      
      for (const entry of validEntries) {
        if (currentSize <= TRIM_TO_SIZE) {
          break;
        }
        
        console.log(`[SW] Deleting oldest entry: ${entry.url}`);
        await cache.delete(entry.url);
        currentSize -= entry.size;
      }
      
      console.log(`[SW] Cache trimmed to ${(currentSize / 1024 / 1024).toFixed(2)} MB.`);
    }
  } catch (error) {
    console.error('[SW] Error trimming cache:', error);
  }
}

/**
 * Check if request is for API
 */
function isApiRequest(url) {
  return url.origin === self.location.origin && 
         (url.pathname.startsWith('/api/') || 
          url.hostname === 'otruyenapi.com');
}

/**
 * Check if request is for images
 */
function isImageRequest(url) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(url.href)) ||
         /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url.pathname);
}

/**
 * Check if request is for static assets
 */
function isStaticAsset(request) {
  return STATIC_CACHE_URLS.includes(url.pathname) ||
         request.destination === 'style' ||
         request.destination === 'script' ||
         request.destination === 'font';
}

/**
 * Handle API requests - Network First with cache fallback
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] API request failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API endpoints
    if (request.url.includes('/api/home')) {
      return new Response(JSON.stringify({
        error: 'Offline - No cached data available',
        stories: [],
        offline: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Offline - API request failed', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Handle image requests - Cache First with network fallback
 */
async function handleImageRequest(request, event) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful image responses
      const responseToCache = networkResponse.clone();
      event.waitUntil(
        (async () => {
          await cache.put(request, responseToCache);
          await trimCache();
        })()
      );
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Image request failed:', request.url);
    
    // Return placeholder image or error response
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable offline</text></svg>',
      {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

/**
 * Handle static asset requests - Cache First
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Asset not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Handle page requests - Network First with offline fallback
 */
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Page request failed, trying cache:', request.url);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/offline');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    return new Response('Page not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Background sync for downloading chapters
 */
self.addEventListener('sync', event => {
  if (event.tag === 'download-chapters') {
    event.waitUntil(handleChapterDownload());
  }
});

/**
 * Handle chapter download in background
 */
async function handleChapterDownload() {
  try {
    // Get download queue from IndexedDB
    const downloadQueue = await getDownloadQueue();
    
    for (const chapter of downloadQueue) {
      try {
        await downloadChapterImages(chapter);
        await removeFromDownloadQueue(chapter.id);
      } catch (error) {
        console.error('[SW] Failed to download chapter:', chapter.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background download failed:', error);
  }
}

/**
 * Download and cache chapter images
 */
async function downloadChapterImages(chapterData) {
  const { chapterId, images } = chapterData;
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  for (const imageUrl of images) {
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        await cache.put(imageUrl, response);
      }
    } catch (error) {
      console.error('[SW] Failed to cache image:', imageUrl, error);
    }
  }
}

/**
 * Simple IndexedDB operations for download queue
 */
async function getDownloadQueue() {
  // This would use IndexedDB to store download queue
  // Simplified for this example
  return [];
}

async function removeFromDownloadQueue(chapterId) {
  // Remove from IndexedDB download queue
  console.log('[SW] Removed from download queue:', chapterId);
}

/**
 * Push notifications for new chapters
 */
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New chapter available!',
      icon: '/logo.svg',
      badge: '/logo.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1,
        url: data.url || '/'
      },
      actions: [
        {
          action: 'explore',
          title: 'Read Now',
          icon: '/read_now.svg'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/close.svg'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Comic Reader', options)
    );
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    const urlToOpen = event.notification.data.url;
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CACHE_CHAPTERS':
        event.waitUntil(cacheChapters(event.data.chapters));
        break;
        
      case 'CLEAR_CACHE':
        event.waitUntil(clearCaches());
        break;
        
      case 'GET_CACHE_SIZE':
        event.waitUntil(getCacheSize().then(size => {
          event.ports[0].postMessage({ cacheSize: size });
        }));
        break;
    }
  }
});

/**
 * Cache specific chapters for offline reading
 */
async function cacheChapters(chapters) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  for (const chapter of chapters) {
    try {
      // Cache chapter data
      await cache.put(
        `/api/chapter/${chapter.id}`,
        new Response(JSON.stringify(chapter), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      
      // Cache chapter images
      for (const imageUrl of chapter.images || []) {
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            await cache.put(imageUrl, response);
          }
        } catch (error) {
          console.error('[SW] Failed to cache image:', imageUrl, error);
        }
      }
    } catch (error) {
      console.error('[SW] Failed to cache chapter:', chapter.id, error);
    }
  }
}

/**
 * Clear all caches
 */
async function clearCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

/**
 * Get total cache size
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

console.log('[SW] Service Worker loaded');