const CACHE_NAME = 'notes-app-cache-v1';
const urlsToCache = [
  './',
  './style.css',
  './index.html',
  './manifest.json',
  './script.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Установка сервис-воркера
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Активизация сервис-воркера
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});

// Обработка push-уведомлений
self.addEventListener('push', function (event) {
  const options = {
    body: event.data.text(), // Содержимое уведомления
    icon: '/icons/icon-192x192.png', // Иконка уведомления
    badge: '/icons/icon-192x192.png', // Значок уведомления
  };

  event.waitUntil(
    self.registration.showNotification('Уведомление от PWA', options)
  );
});