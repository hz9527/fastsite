const fs = require('fs')
const path = require('path')
function SWPlugin (options) {
  // todo should check every opt
  this.options = options || {}
  this.config = {
    client: ['VERSION', 'preFetch', 'injectCss', 'injectJs', 'appName'],
    work: ['cacheId', 'preFetch', 'shouldFetchHandler', 'nameHandler']
  }
}

SWPlugin.prototype.apply = function (compiler) {
  this.genOption(compiler.options)
  compiler.plugin('afterEmit', (compilation, callback) => {
    /**
     * Define包含cacheId shouldFetchHandler nameHandler VERSION injectCss injectJs appName preFetch
     * 其中cacheId shouldFetchHandler nameHandler和页面无关
     * VERSION injectCss injectJs appName preFetch与页面有关
    */
    const Define = this.genDefine(Object.keys(compilation.assets).filter(file => !/\.map$/.test(file)))
    Promise.all( // 重写html，生成js及sw文件
      this.genFile(this.options.rewriteHtmlPath, this.options.rewriteHtmlPath, Define),
      this.genFile(this.options.swTemplatePath, this.joinPath(this.options.filepath, this.options.filename), Define)
    ).then(callback, callback)
  })
}

SWPlugin.prototype.genOption = function (conf) {
  let htmlTem = ''
  let rewriteHtmlPath = ''
  conf.plugins.forEach(item => { // 依赖 HtmlWebpackPlugin 插件
    if (item.constructor.name === 'HtmlWebpackPlugin') {
      htmlTem = item.options.template
      rewriteHtmlPath = this.joinPath(conf.output.path, item.options.filename)
    }
  })
  let options = {
    filename: 'sw.js',
    filepath: conf.output.path,
    minify: true,
    inject: true,
    htmlTem,
    rewriteHtmlPath, // todo 支持多页
    clientTemplatePath: path.join(__dirname, './client.template.js'),
    swTemplatePath: path.join(__dirname, './sw.template.js'),
    cacheId: 'cacheId',
    prefetch: () => true,
    ignore: () => false,
    shouldFetch: urlObj => /\.png|jpe?g|js|css|html$/.test(urlObj.pathname),
    assetsPublicPath: conf.output.publicPath,
    nameType: () => '[name].[hash]'
  }
  this.options = Object.assign(options, this.options)
}

SWPlugin.prototype.genInject = function (html, htmlTem) {
  let injectCss = []
  let injectJs = []
  return {injectCss, injectJs}
}

SWPlugin.prototype.genPrefetchList = function (files, html) {
  if (!('router' in this.options)) {
    this.options.router = []
    let html = files.find(item => /\.html$/.test(item))
    html && this.options.router.push({
      handlerPath: urlObj => urlObj.pathname === '/',
      file: html, // 自定义file时可以这样 /static/index.html
      cacheFirst: true
    })
  }
  let htmls = []
  this.options.router.forEach(item => { // check config valid
    if (item.file) htmls.push(item.file)
    if (item.cacheFirst === false && item.fallBack) htmls.push(item.fallBack)
  })
  return files.filter(file => this.options.prefetch(file) && !this.options.ignore(file) && !/\.html$/.test(file))
    .map(file => this.joinPath(this.options.assetsPublicPath, file)).concat(htmls)
}

SWPlugin.prototype.getVersion = function (prefetch, inject) {
  this.version = ''
}

SWPlugin.prototype.genDefineBase = function (files) {
  let cacheId = `'sw-plugin-${this.options.cacheId}'`
  // let VERSION = this.getVersion(files)
  // let preFetch = `[\n\t${this.genPrefetchList(files).join(',\n\t')}\n]`
  let shouldFetchHandler = this.options.shouldFetch.toString()
  let nameHandler = this.options.nameType.toString()
  return {
    cacheId,
    shouldFetchHandler, // return true or false
    nameHandler // return [name].[hash]
  }
}

SWPlugin.prototype.genFile = function (input, output, define) {
  return new Promise((resolve, reject) => {
    fs.readFile(input, (err, fd) => {
      if (err) reject(err)
      let str = fd.toString()
      Object.keys(define).forEach(key => {
        str = this.replace(str, key, define[key])
      })
      fs.writeFile(output, str, err => err ? reject(err) : resolve())
    })
  })
}

SWPlugin.prototype.joinPath = function (pubPath, filePath) {
  pubPath = /\/$/.test(pubPath) ? pubPath.slice(0, -1) : pubPath
  return `${pubPath}${filePath[0] === '/' ? '' : '/'}${filePath}`
}

SWPlugin.prototype.replace = function (str, key, value) {
  return str.replace(new RegExp(`<!\\s*?${key}\\s*?>`, 'g'), value)
}
// SWPlugin.prototype.genSwFile = function (handlers) {
//   // fileList注入到html中，handlers，cacheId，router注入到sw中
//   return new Promise((resolve, reject) => {
//     fs.readFile(this.options.templatePath, (err, fd) => {
//       if (err) reject(err)
//       let str = this.replace(fd.toString(), 'cacheId', `'sw-plugin-${this.options.cacheId}'`)
//       Object.keys(handlers).forEach(key => {
//         str = this.replace(str, key, handlers[key])
//       })
//       str += fd.toString()
//       let filePath = this.joinPath(this.options.filepath, this.options.filename)
//       fs.writeFile(filePath, str, err => err ? reject(err) : resolve())
//     })
//   })
// }

module.exports = SWPlugin
