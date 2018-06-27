# serviceWorkerDemo

## 问题

> 目前关于serviceWorker矛盾在于，由于当前sw接管了页面致使更新只能到N+1次有效，即使N次更新也需要使用交互或者脚本做一次reload操作，并不是很优雅

## 解决方案

问题的原因是sw更新使得新的sw需要替换老的sw致使只能在下一次才能使fetch返回新的缓存。  
因此解决方案有：

1. 不更新sw文件
2. 不缓存html，即每次能拉取新的js、css这样就能每次fetch新的资源

方案1咋一看问题应该挺大的，方案二如果只是正常的页面其实还ok，但是不太适合首页过大的情况，比如使用架框渲染就不是很友好了

### 大致方案

首先我们可以默认入口html不是只有一个div（即架框渲染或预渲染），架框预渲染改动可能性不大，或者是在UI没有大的升级的情况下没必要更改；而预渲染则可能是频繁更改。  
其次肯定是需要考虑资源加载问题，即我们默认js、css的更新是频繁并是部分更新，那么问题来了，如何解决hash问题，这可能导致我们在cacheStorage里根本不知道如何删除之前的缓存。我们只需要将原url由`[name].[hash].ext` 变为 `[name].ext?hash=[hash]`，在取数据时严格按照url查询，清空缓存则忽略search字段，示例代码如下：

```JavaScript
self.addEventListener('fetch', event => {
  // ...
  event.responseWith(
    caches.open(cacheName).then(cache => {
      let request = getRequest(event.request)
      return cache.match(request)
        .then(res => {
          if (res) {
            return res
          } else {
            return fetch(event.request).then(response => {
              if (response.ok) {
                cache.match(request, {ignoreSearch: true})
                  .then(res => res ? cache.delete(request, {ignoreSearch: true}) : null)
                  .then(() => cache.put(request, response.clone()))
              }
              return response
            })
        }
      })
    })
  )
})
```

因此解决方案如下：

1. 缓存html，每次请求一个动态html来动态插入js、css等

### 关于不缓存的script

不缓存script内主要作用是动态往html中注入css、js及在localStorage中写入版本号，有一个js为注入预渲染字符串（架框可以写死在html里）

### 关于预缓存

由于希望sw不更新，所以预缓存不需要在sw文件里，而应该是客户端通过postMessage来通知sw，客户端通过localStorage内版本号来控制是否需要通知

### 关于清除缓存

从用户体验角度来讲，是否清除缓存不会对用户造成多大的影响，但是实际上这样是不好的。我们可以将缓存的资源（文件）分为两类，一类是会有打包版本的资源，如`app.hash.js`，即该资源确实能通过名字和hash确定同一文件的不同版本；一类则是文件hash资源，如`hash.png` `index.html`我们从文件无法区分是否是同一文件的不同版本，因此对于前者我们可以通过上述将请求改为`name.ext?hash=hash`的方式缓存，对于前者，我们可以在请求资源时确定是否有非此hash（‘版本’）文件，对于后者则在message中删除非当前版本资源。结合预缓存，示例代码如下：

```js
// client

// sw
self.addEventListener('message', msg => { // {exec: 'update', data: {precatch: Array, version: String}}
  caches.open(cacheId)
    .then(cache => {
      // prefetch
      cache.keys().then()
    })
})
```

### 关于404页面

sw本质上是客户端的本地代理，因此建议404页面应该通过sw中访问`self.navigator.onLine`来决定返回什么页面

### 关于HTML

不论是架框渲染还是预渲染，如果缓存html那么架框、预渲染是静态放在html中，那么更新后还是会因为缓存更新滞后会变成N+1，所以可以单独作为script，脚本将注入html片段字符串，当然如果对于架框渲染或者预渲染其实N+1次更新可能是可以容忍的，这个取决于业务场景

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>sw</title>
  </head>
  <body>
    <div id="app"></div>
    <script>
      window.SEND_TO_SW = {
        _state: 'init',
        _cacheList: [],
        send (exec, data) {
          // ...
        },
        setState (state) {
          // ...
        }
      }
      if (location.protocol === 'https' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(register => {
          register.addEventListener('updatefound', () => {
            const newWorker = register.installing
            newWorker.addEventListener('statechange', (e) => {
              if (newWorker.state === 'activated') SEND_TO_SW.setState('activated')
            })
          })
        })
        if (navigator.serviceWorker.controller) SEND_TO_SW.setState('activated')
      } else {
        SEND_TO_SW.setState('notSupport')
      }
    </script>
    <script> // 这个其实是每次动态拉取的js
      window.NEED_UPDATE = true;
      try {
        window.NEED_UPDAT = localStorage.getItem('appVersion') === curVersion;
        window.NEED_UPDAT && localStorage.setItem('appVersion', curVersion);
      } catch (err) {
        console.log(err)
      }
      // inject css & js 在业务代码中注入更新，当然也可以在此注入更新。具体看业务场景
    </script>
  </body>
</html>

```

### 插件设计

对于以上方案均可以设计为webpack插件
