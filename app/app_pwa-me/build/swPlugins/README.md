# sw-plugin

## API设计

**公共基础部分**

* minify 是否压缩

**sw基础部分**

* filename 生成文件名
* filepath 生成文件
* swTemplatePath 自定义sw模板路径

**client基础部分**

* inject 是否将html注入的js及css动态注入，即不更新sw方案
* htmlTem html模板
* rewriteHtmlPath 重写html文件，即对比html模板，将模版中不存在的js、css动态注入
* clientTemplatePath 自定义动态script模板路径

**模版部分**

* cacheId cacheStorage缓存名，会加上`sw-plugin`前缀
* prefetch 在install时缓存文件列表，支持`Array<String | RegExp> Function`
* ignore 不缓存文件，支持`Array<String | RegExp> Function`
* shouldFetch 在fetch事件时决定是否处理，支持`Array<String | RegExp> Function`
* assetsPublicPath 资源绝对路径，忽略`.html` 默认读取webpack，支持String Function
* nameType 默认[name].[hash]若匹配失败则不处理为hash模式，支持String Function
* router Array 每一项为一个对象，包含`pathHandler file cacheFirst fallBack`

> router对象是处理html返回的配置

**高级**

- [ ] messageHandler
- [ ] fetchHandler

### 自定义模板

自定义模板就是js文件，允许注入变量，示例如下：

```js
// 例如cacheId为test
// 模板文件
const myCacheId = <! cacheId >

// 生成文件
const myCacheId = 'test'
```

|注入变量名 |数据类型 |如何计算出该变量 |备注 |
|---|---|---|---|
|cacheId | String | `'sw-plugin' + options.cacheId` | 仅swTemplate能注入 |
|VERSION | String |preFetch及injectCss及injectJs组成的文件名列表计算的md5值 | sw及client模版均能注入 |
|preFetch | Array <String> | 由prefetch、ignore及router生成，并会根据assetsPublicPath补全 | sw及client模版均能注入 |
|shouldFetchHandler | Function | shouldFetch |仅swTemplate能注入|
|nameHandler | Function | nameType |仅swTemplate能注入|
|injectCss | Array <String> | rewriteHtmlPath中存在 htmlTem不存在的css | 仅clientTemplate能注入 |
|injectJs | Array <String> | rewriteHtmlPath中存在 htmlTem不存在的js | 仅clientTemplate能注入 |

executer自带封装两种方法 preLoad, init

### 单页与多页


## 大致思路

1. 获取webpack配置及打包文件列表，生成本插件基本配置及资源列表
2. 将打包生成文件名数组作为md5入参计算出版本号
3. 读取模板文件，生成文件

## sw文件设计

1. 将资源hash变为query形式，如果不存在name则不处理，如abs.hash.js将变为abs.js?hash=hash；hash.png将变成hash.png?sw_version=version。作为资源版本控制
2. install将删除缓存并存储资源，并直接跳转为接管状态，接管页面直接通知客户端
3. fetch事件则根据prefetch及shouldFetch来决定是否处理本次请求
4. 默认处理请求为资源存在则直接返回，不存在则拉取资源并删除非本版本缓存。即缓存优先
