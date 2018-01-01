## pwa
### serviceWorker
#### 1. 管辖范围  
serviceWorker注册文件只能管辖注册文件所在目录下所有文件  
#### 2. 注册文件（sw.js）  
注册文件主要是用来决定缓存策略的，并且该文件也不需要在html中加载，self为serviceWorker实例，由外部安装，内部监听事件，如

```JavaScript
// app.js
if ('servericeWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.servericeWorker.register('./sw.js')
      .then(reg => console.log('register successful'))
      .catch(err => console.log('err'))
  })
}

// sw.js
const cacheName = 'some-app'
const cacheFileList = [...] // some file list
// add cache list
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(catchFileList)
      }).then(e => {
        return self.skipWaiting()
      })
  )
})
// clean old cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(names.map(name => {
        if (name !== cacheName) {
          return caches.delete(name)
        }
      }))
    }).then(() => {
      clients.claim() // self.clients.claim()
    })
  )
})
// fetch resquest
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName).then(cache => {
      return cache.match(event.request).then(response => {
        if (response) {
          return response
        } else {
          return fetch(event.request).then(response => response)
        }
      })
    })
  )
})
```

> 正因为未被引入到`html`中，`sw.js`是一个特殊的宿主环境，比如你不能使用`window`，因此宿主环境就是`self`，不同于`node`中的`global`与浏览器中的`window`
注册的`serviceWorker`提供诸如`caches`等全局变量，`caches`就是`cacheStorage`
那么意味着我们`code`时，可以适当省去`self`，如`self.caches === caches` `self.clients = clients`
另外全局`this`指向`self`

整体参考：![sw1](./sw1.png)

#### 3. install失败问题
虽然当`install`失败在下一次加载还是会重新尝试，但是为了代码的健壮，还是应该做一些处理。我们可以将缓存资源分为较小、稳定的和较大、不稳定的。然后`waitUntil`也是异步操作，因此整体方案如下：

```JavaScript
self.addEventListener('install', e => {
  waitUnit(
    caches.open(cacheName).then(cache => {
      cache.addAll(...) // some big or unstable
      return cache.addAll(...) // some small or stable
    }).then(() => {
      self.skipWaiting()
    })
  )
})
```

> 关于`skipWaiting`，在`sw`第一次被注册时即使不执行`skipWaiting`也会触发`active`事件，但是更新`sw`文件后第二次加载就不会。`skipWaiting`即跳过本状态

#### 4. 跨域，如缓存cdn问题如何把控
既然`fetch`事件能拦截一切网络请求，也就意味着，我们可以在`fetch`中缓存`cdn`资源

```JavaScript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName).then(cache => {
      return cache.match(event.request).then(res => {
        if (res) {
          return res
        } else {
          fetch(event.request).then(res => {
            if (cdnList.find(item => event.request.url.indexOf(item) > -1)) {
              cache.put(event.request, res.clone())
            }
            return res
          })
        }
      })
    })
  )
})
```

#### 5. sw更新后发生了什么？
首先我们知道一旦请求被`caches`缓存了，并且在`fetch`中处理为缓存策略，那么再次请求会直接返回缓存的文件。如果`sw`更新了就会触发新的`sw`一系列事件周期，如`install`等，但很不幸，刚刚的请求是由‘前任’处理的，因此此时页面还是上一次的，但是再次加载就会返回新的缓存。因此更新`s`w只是’现任取代‘前任’而已。  
说到这，还是再提一下`self.skipWaiting()`,执行才会使新的`fetch`及`activate`事件更新，否则`install`会一直处于挂起状态，而不会更新其他事件  
另外就是`clients.cliam()`方法，这个其实是用来告诉客户端，新的`sw`已经上位了，客户端可以监听相关事件然后刷新页面，所以可以做到当次更新，而不是N+1次更新，但是有一个问题，如何确定客户端当前页面不是缓存中取出来的？

1. `sw`在`fetch`时`postMessage`及客户端监听`controllerchange`事件去决定是否刷新页面。这种比较笨
2. 直接判断`navigator.serviceWorker.controller`是否存在，并确认触发了`controllerchange`事件

```JavaScript
navigator.serviceWorker.register('./sw.js').then(reg => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('controllerchange', e => {
      location.reload()
    })
  }
})
```

#### 6. caches是个啥？

#### 7. clients是个啥？

#### 8. 通信方案

#### 9. 缓存方案
