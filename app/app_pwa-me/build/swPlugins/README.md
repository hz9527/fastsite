# sw-plugin

## API设计

**基础部分**

* filename 生成文件名
* filepath 生成文件
* minify 是否压缩
* templatePath 自定义模板路径

**模版部分**

* cacheId
* prefetch 在install时缓存文件列表，支持`Array<String | RegExp> Function`
* ignore 不缓存文件，支持`Array<String | RegExp> Function`
* shouldFetch 在fetch事件时决定是否处理，支持`Array<String | RegExp> Function`
* assetsPublicPath 资源绝对路径，忽略`/ .html` 默认读取webpack，支持String Function
* nameType 默认[name].[hash].ext以.分隔判断若不存在两者则不处理为hash模式，支持String Function
* cacheHtml 默认true，缓存html
* index 默认index.html

**高级**

- [ ] fallback 404页面
- [ ] message 是否监听message
- [ ] messageHandler
- [ ] fetchHandler
- [ ] skipWait 在install是否直接skipWaiting

**自定义模板相关**

1. prefetch将由prefetch、ignore、assetsPublicPath生成
2. prefetch字段将作为数组传入，如果值为函数将先把webpack生成资源全部传入，资源将先经过prefix；数组字符串将先prefix，正则则不会
3. shouldFetch，nameType将处理为函数传入

## 大致思路

1. 获取webpack配置及打包文件列表，生成本插件基本配置及资源列表
2. 读取模板文件，生成文件

## sw文件设计

1. 将资源hash变为query形式，如果不存在name则不处理，如abs.hash.js将变为abs.js？hash=hash；hash.png将变成hash.png。作为资源版本控制
2. install将删除缓存并存储资源，并直接跳转为接管状态，接管页面直接通知客户端
3. fetch事件则根据prefetch及shouldFetch来决定是否处理本次请求
4. 默认处理请求为资源存在则直接返回，不存在则拉取资源并删除非本版本缓存。即缓存优先
