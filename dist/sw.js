// OnScreen Medical App Service Worker v2.1.0
// Progressive Web App з offline підтримкою

const CACHE_NAME = 'onscreen-v2.1.0';
const STATIC_CACHE = 'onscreen-static-v2.1.0';
const DYNAMIC_CACHE = 'onscreen-dynamic-v2.1.0';

// Ресурси для кешування при установці
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/medical-icon.svg'
];

// Стратегії кешування
const CACHE_STRATEGIES = {
  // Статичні ресурси - Cache First
  static: [
    /\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|eot)$/,
    /\/static\//
  ],
  
  // API запити - Network First
  api: [
    /\/api\//
  ],
  
  // HTML сторінки - Network First з fallback
  pages: [
    /\/$/,
    /\/profile/,
    /\/education/,
    /\/calendar/,
    /\/medical-map/
  ]
};

// Встановлення Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Кешуємо статичні ресурси
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Пропускаємо очікування для швидкого оновлення
      self.skipWaiting()
    ])
  );
});

// Активація Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Очищення старих кешів
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Беремо контроль над всіма клієнтами
      self.clients.claim()
    ])
  );
});

// Перехоплення мережевих запитів
self.addEventListener('fetch', event => {
  const { request } = event;
  const { url, method } = request;

  // Тільки GET запити
  if (method !== 'GET') {
    return;
  }

  // Локальні дані (localStorage) не обробляємо
  if (url.includes('localhost') && url.includes('#')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Обробка запитів з різними стратегіями
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Статичні ресурси - Cache First
  if (isStaticAsset(url)) {
    return cacheFirst(request);
  }
  
  // API запити - Network First
  if (isApiRequest(url)) {
    return networkFirst(request);
  }
  
  // HTML сторінки - Network First з fallback
  if (isPageRequest(url)) {
    return networkFirstWithFallback(request);
  }
  
  // За замовчуванням - Network First
  return networkFirst(request);
}

// Cache First стратегія
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Офлайн fallback для зображень
    if (request.destination === 'image') {
      return caches.match('/medical-icon.svg');
    }
    throw error;
  }
}

// Network First стратегія
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network First з fallback для сторінок
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Спробуємо знайти в кеші
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback на головну сторінку
    const indexResponse = await caches.match('/');
    if (indexResponse) {
      return indexResponse;
    }
    
    // Створюємо офлайн сторінку
    return new Response(
      createOfflinePage(),
      {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      }
    );
  }
}

// Перевірка типів запитів
function isStaticAsset(url) {
  return CACHE_STRATEGIES.static.some(pattern => pattern.test(url.pathname));
}

function isApiRequest(url) {
  return CACHE_STRATEGIES.api.some(pattern => pattern.test(url.pathname));
}

function isPageRequest(url) {
  return CACHE_STRATEGIES.pages.some(pattern => pattern.test(url.pathname)) ||
         url.pathname.endsWith('.html') ||
         (url.pathname === '/' && !url.pathname.includes('.'));
}

// Створення офлайн сторінки
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OnScreen - Офлайн режим</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
        }
        .container {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          max-width: 400px;
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }
        h1 {
          color: #2563eb;
          margin-bottom: 16px;
        }
        p {
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin: 8px;
        }
        .button:hover {
          background: #1d4ed8;
        }
        .status {
          margin-top: 20px;
          padding: 12px;
          background: #fef3c7;
          border-radius: 8px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🏥</div>
        <h1>OnScreen</h1>
        <p>Ви працюєте в офлайн режимі. Медичні дані зберігаються локально та залишаються доступними.</p>
        
        <button class="button" onclick="window.location.reload()">
          🔄 Перевірити з'єднання
        </button>
        
        <button class="button" onclick="window.history.back()">
          ← Назад
        </button>
        
        <div class="status">
          📱 Ваші медичні дані захищені та доступні офлайн
        </div>
      </div>
      
      <script>
        // Автоматична перевірка з'єднання
        window.addEventListener('online', () => {
          window.location.reload();
        });
        
        // Статус з'єднання
        if (!navigator.onLine) {
          document.querySelector('.status').innerHTML = '❌ Немає з\'єднання з інтернетом';
        }
      </script>
    </body>
    </html>
  `;
}

// Push повідомлення (для майбутніх версій)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/medical-icon.svg',
    tag: 'onscreen-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Відкрити додаток'
      },
      {
        action: 'close',
        title: 'Закрити'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'OnScreen', options)
  );
});

// Обробка кліків по повідомленнях
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Синхронізація у фоні (для майбутніх версій)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Синхронізація медичних даних при відновленні з'єднання
  // В майбутніх версіях тут буде логіка синхронізації
} 