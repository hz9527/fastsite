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
const catchName = 'some-app'
const catchFileList = [...] // some file list
// add cache list
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        cache.addAll(catchFileList)
      })
  )
})
// clean old cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(names.map(name => {
        return caches.delete(name)
      }))
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

> 正因为未被引入到html中，sw.js是一个特殊的宿主环境，比如你不能使用window，因此宿主环境就是self，不同于node中的global与浏览器中的window
注册的serviceWorker提供诸如caches等全局变量，caches就是cacheStorage

整体参考：![sw1](./sw1.png)

#### 3. install失败问题
虽然

#### 4. 跨域，如缓存cdn问题如何把控

#### 5. sw更新后发生了什么？

#### 6. caches到底是个啥？

#### 7. N+1次更新

#### 8. 通信方案
