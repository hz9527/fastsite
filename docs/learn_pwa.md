### pwa
#### serviceWorker
1. 管辖范围  
serviceWorker注册文件只能管辖注册文件所在目录下所有文件  
2. 注册文件（sw.js）  
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
const catchFileList = []
```

> 正因为未被引入到html中，sw.js是一个特殊的宿主环境，比如你不能使用window，因此宿主环境就是self，不同于node中的global与浏览器中的window
