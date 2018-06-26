// const preFetch = [];

// const shouldFetchHandler = () => {};
// const nameHandler = () => {}; // [name].[hash].ext

// const cacheId = 'sw-key';
// const Index = 'index.html'

function getUrlObj (url) {
  let nameMap = {reg: null, map: []};
  // name + 间隔符 + hash 间隔符是任意的，如. - _等等 
  nameMap.reg = nameHandler(url).replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").replace(/(\\\[name\\\])|(\\\[hash\\\])/g, sub => {
    sub && nameMap.map.push(sub.replace(/\\/g, ''));
    return '(.+)'
  })
  let urlObj = url.split(/\/(?!\/)/);
  let fileName = urlObj.pop();
  let extInd = fileName.lastIndexOf('.');
  let ext = fileName.slice(extInd + 1);
  fileName = fileName.slice(0, extInd);
  let file = fileName.match(new RegExp(nameMap.reg));
  let name = [];
  let hash = [];
  if (file) {
    file.forEach((info, i) => {
      if (i > 0) nameMap.map[i - 1] === '[name]' ? name.push(info) : hash.push(info);
    })
  } else {
    name.push(fileName);
  }
  let baseUrl = urlObj.join('/');
  return { baseUrl, name, hash, ext }
}

function getRequest(url, opt = {mode: 'no-cors'}) {
  return new Request(url, opt)
}

function getCacheResquest (url) {
  let {baseUrl, name, hash, ext} = nameHandler(url);
  let cacheUrl = `${baseUrl}/${name.join('-')}.${ext}${hash.length > 0 ? `?hash=${hash.join('-')}` : ''}`
  return getRequest(cacheUrl)
}

function getResponseByCache (cache, url) {
  let cacheRequest = getCacheResquest(url)
  return cache.match(cacheRequest).then(res => {
    if (res) {
      return res
    } else {
      return fetch(getRequest(url))
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
  event.waitUntil(
    caches.open(cacheId)
      .then(cache => {
        return Promise.all(preFetch.map(url => getResponseByCache(cache, url)))
      }).then(e => {
        return self.skipWaiting()
      }).catch(err => {
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', event => {
  let url = event.request.url
  let shouldFetch = preFetch.some(item => item === url)
  if (!shouldFetch) shouldFetch = shouldFetchHandler(url)
  if (!shouldFetch && Index) { // 判断URL是否为请求html
    // todo 这里并不完善
    let route = url.split(/\/(?!\/)/)
    route.splice(0, 2)
    route.join('/')
    if (route.indexOf('.') === -1) {
      shouldFetch = true
      url = Index
    }
  }
  if (shouldFetch) {
    event.respondWith(
      caches.open(cacheId).then(cache => {
        return getResponseByCache(cache, url)
      })
    )
  }
})