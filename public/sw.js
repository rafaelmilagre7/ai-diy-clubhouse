
const CACHE_NAME = 'viver-ia-v1';
const STATIC_CACHE = 'viver-ia-static-v1';
const DYNAMIC_CACHE = 'viver-ia-dynamic-v1';

// Recursos para cache estático
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/solutions',
  '/tools',
  '/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Cacheing static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Service Worker: Removendo cache antigo', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia Cache First para assets estáticos
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
    return;
  }

  // Estratégia Network First para dados dinâmicos
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache em caso de falha de rede
          return caches.match(request);
        })
    );
    return;
  }

  // Estratégia Stale While Revalidate para imagens e outros recursos
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          return cache.match(request)
            .then(response => {
              const fetchPromise = fetch(request)
                .then(networkResponse => {
                  cache.put(request, networkResponse.clone());
                  return networkResponse;
                });
              
              return response || fetchPromise;
            });
        })
    );
    return;
  }

  // Default: tentar rede primeiro, depois cache
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Background sync para ações offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync');
    // Implementar sincronização de dados offline
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png',
      badge: '/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver mais',
          icon: '/icons/checkmark.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icons/xmark.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
