
const CACHE_NAME = 'viver-de-ia-v1';
const STATIC_CACHE_NAME = 'viver-de-ia-static-v1';
const DYNAMIC_CACHE_NAME = 'viver-de-ia-dynamic-v1';

// Recursos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/solutions',
  '/tools',
  '/manifest.json',
  '/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  'static': 'cache-first',
  'api': 'network-first',
  'images': 'cache-first',
  'pages': 'network-first'
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Estratégia para APIs do Supabase
    if (url.hostname.includes('supabase.co')) {
      return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // Estratégia para imagens
    if (request.destination === 'image') {
      return await cacheFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // Estratégia para assets estáticos (JS, CSS)
    if (url.pathname.includes('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // Estratégia para páginas HTML
    if (request.destination === 'document') {
      return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // Default: network first
    return await networkFirst(request, DYNAMIC_CACHE_NAME);
    
  } catch (error) {
    console.error('Service Worker: Fetch error:', error);
    
    // Fallback para páginas offline
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return await cache.match('/') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Atualizar cache em background se for uma imagem
    if (request.destination === 'image') {
      updateCacheInBackground(request, cache);
    }
    return cached;
  }
  
  const response = await fetch(request);
  
  if (response.ok) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Atualizar cache em background
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response);
    }
  } catch (error) {
    console.log('Background cache update failed:', error);
  }
}

// Limpar cache antigo periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanOldCache();
  }
});

async function cleanOldCache() {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const requests = await cache.keys();
  
  // Manter apenas os 100 recursos mais recentes
  if (requests.length > 100) {
    const toDelete = requests.slice(100);
    await Promise.all(toDelete.map(request => cache.delete(request)));
  }
}
