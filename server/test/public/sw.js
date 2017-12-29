const cacheName = 'test'

const catchList = ['./index.html', './index.js']

self.removeEventListener('fetch', [])

self.addEventListener('install', event => {
  console.log('install')
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        console.log('cache file')
        return cache.addAll(catchList)
      }).then(() => {
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', event => {
  console.log('activate', 123)
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log('delete cache')
      return Promise.all(cacheNames.map(name => {
        return caches.delete(name)
      })).then(() => {
        return self.clients.claim()
      })
    })
  )
})

self.addEventListener('fetch', event => {
  console.log(234)
  event.respondWith(
    caches.open(cacheName).then(function(cache) {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  )
  console.log('fetch', 234)
  // setTimeout(() => {
  //   self.clients.matchAll().then(clients => {
  //     clients.forEach(c => {
  //       console.log(c.postMessage)
  //       c.postMessage('sw to client message')
  //     })
  //   })
  // }, 1000)
})
console.log(self.removeEventListener, 234)

self.addEventListener('message', e => {
  console.log(e, 'sw receive message')
})
