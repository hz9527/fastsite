const cacheName = 'test'

const catchList = ['./index.html', './index.js', './test.js']

const lock = false

self.addEventListener('install', event => {
  console.log('install')
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return Promise.all(catchList.map(url => {
          let request = new Request(url)
          fetch(request)
            .then(res => {
              if (res.ok) {
                cache.put(request, res.clone())
              }
            })
        }))
        // return cache.addAll(catchList)
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
        console.log(name, 321)
        return caches.delete(name)
      })).then(() => {
        return self.clients.claim()
      })
    })
  )
})

self.addEventListener('fetch', event => {
  console.log('fetch')
  event.respondWith(
    caches.open(cacheName).then(function(cache) {
      // console.log(cache)
      return cache.match(event.request).then(response => {
        // console.log(response, 123)
        return response || fetch(event.request).then(response => {
          console.log(response)
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  )
  // console.log('fetch', 321)
})
// console.log(self.removeEventListener, 234)

self.addEventListener('message', e => {
  console.log(e.data, 'sw receive message')
  clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage('message from sw')
    })
  })
})
