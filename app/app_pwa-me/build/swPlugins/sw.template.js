const shouldFetchHandler = <% shouldFetchHandler %>
const nameHandler = <% nameHandler %> // [name].[hash].ext
const cacheId = <% cacheId %>
const Router = <% Router %>
self.VERSION = '1.0'

// function getUrlObj (url) {
//   let nameMap = {reg: null, map: []};
//   // name + 间隔符 + hash 间隔符是任意的，如. - _等等
//   nameMap.reg = nameHandler(url).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1').replace(/(\\\[name\\\])|(\\\[hash\\\])/g, sub => {
//     sub && nameMap.map.push(sub.replace(/\\/g, ''))
//     return '(.+)'
//   })
//   let urlObj = url.split(/\/(?!\/)/)
//   let fileName = urlObj.pop()
//   let extInd = fileName.lastIndexOf('.')
//   let ext = fileName.slice(extInd + 1)
//   fileName = fileName.slice(0, extInd)
//   let file = fileName.match(new RegExp(nameMap.reg))
//   let name = []
//   let hash = []
//   if (file) {
//     file.forEach((info, i) => {
//       if (i > 0) nameMap.map[i - 1] === '[name]' ? name.push(info) : hash.push(info)
//     })
//   } else {
//     name.push(fileName)
//   }
//   let baseUrl = urlObj.join('/')
//   return { baseUrl, name, hash, ext }
// }
function getUrlObj (url) {
  return new URL(url, self.location.origin)
}

function transUrl (urlObj) {
  let nameMap = { reg: null, map: [] }
  // name + 间隔符 + hash 间隔符是任意的，如. - _等等
  nameMap.reg = nameHandler(urlObj).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1').replace(/(\\\[name\\\])|(\\\[hash\\\])/g, sub => {
    sub && nameMap.map.push(sub.replace(/\\/g, ''))
    return '(.+)'
  })
  let path = urlObj.pathname.replace(/[^\/\.]+\.+/, '')
  let fileName = urlObj.pathname.slice(path.length + 1)
  let extInd = fileName.lastIndexOf('.')
  let ext = fileName.slice(extInd + 1)
  fileName = fileName.slice(0, extInd)
  let file = fileName.match(new RegExp(nameMap.reg))
  let name = []
  let hash = []
  if (file) {
    file.forEach((info, i) => {
      if (i > 0) nameMap.map[i - 1] === '[name]' ? name.push(info) : hash.push(info)
    })
  } else {
    name.push(fileName)
  }
  return { baseUrl: urlObj.origin + path, urlHash: urlObj.hash, urlSearch: urlObj.search, name, hash, ext }
}

function getRequest (url, opt = {mode: 'no-cors'}) {
  return new Request(url, opt)
}

function getCacheResquest (urlObj) {
  let { baseUrl, urlHash, urlSearch, name, hash, ext } = transUrl(urlObj)
  let fileName = `${name.join('-')}${ext ? '.' + ext : ''}`
  let search = hash.length > 0 ? `hash=${hash.join('-')}` : `sw_version=${self.VERSION}`
  search = (urlSearch || '?') + search
  let cacheUrl = `${baseUrl}${fileName}${search}${urlHash}`
  return getRequest(cacheUrl)
}

function getResponseByCache (cache, urlObj) {
  let cacheRequest = getCacheResquest(urlObj)
  return cache.match(cacheRequest).then(res => {
    if (res) {
      return res
    } else {
      return fetch(getRequest(urlObj.href))
        .then(response => {
          if (response.ok || response.type === 'opaque') {
            cache.match(cacheRequest, { ignoreSearch: true })
              .then(result => result && cache.delete(cacheRequest, { ignoreSearch: true }))
              .then(() => cache.put(cacheRequest, response.clone()))
          }
          return response
        })
    }
  })
}

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', event => {
  let urlObj = getUrlObj(event.request.url)
  let shouldFetch = shouldFetch = shouldFetchHandler(urlObj)
  if (!shouldFetch) { // 判断URL是否为请求html
    let ind = Router.findIndex(item => item.handlerPath(urlObj))
    shouldFetch = ind > -1
    if (shouldFetch && !Router[ind].cacheFirst) {
      urlObj = self.navigator.onLine ? urlObj : getUrlObj(Router[ind].fallBack)
    }
  }
  if (shouldFetch) {
    event.respondWith(
      caches.open(cacheId).then(cache => {
        return getResponseByCache(cache, urlObj)
      })
    )
  }
})

self.executer = {
  init (data) {
    self.VERSION = data.version
    return this.preLoad(data.list)
  },
  preLoad (list) {
    return caches.open(cacheId).then(cache => {
      return Promise.all(list.map(url => getResponseByCache(cache, getUrlObj(url))))
    })
  }
}

self.addEventListener('message', ({data}) => {
  if (data && typeof data === 'object' && data.exec && typeof self.executer[data.exec] === 'function') {
    self.executer[data.exec](data.data)
  }
})
