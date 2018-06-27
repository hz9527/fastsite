const fs = require('fs')
const path = require('path')
function SWPlugin (options) {
   // todo should check every opt
  this.options = options || {}
  this.version = ''
}

SWPlugin.prototype.apply = function (compiler) {
  this.genOption(compiler.options)
  compiler.plugin('emit', (compilation, callback) => {
    let files = Object.keys(compilation.assets).filter(file => !/\.map$/.test(file))
    this.getVersion(files)
    this.genSwFile(
      this.genPrefetchList(files),
      this.genHandlers()
    ).then(callback, callback)
  })
}

SWPlugin.prototype.genOption = function (conf) {
  let options = {
    filename: 'sw.js',
    filepath: conf.output.path,
    minify: true,
    templatePath: path.join(__dirname, './sw.template.js'),
    cacheId: 'cacheId',
    prefetch: () => true,
    ignore: () => false,
    shouldFetch: url => /\.png|jpe?g|js|css|html$/.test(url),
    assetsPublicPath: conf.output.publicPath,
    nameType: () => '[name].[hash]'
  }
  this.options = Object.assign(options, this.options)
}

SWPlugin.prototype.genPrefetchList = function (files) {
  let html = files.find(item => /\.html$/.test(item))
  if (!('router' in this.options) && html) {
    this.options.router = [
      {
        handlerPath: urlObj => urlObj.pathname === '/',
        file: html, // 自定义file时可以这样 /static/index.html
        cacheFirst: true
      }
    ]
  }
  return files.filter(file => this.options.prefetch(file) && !this.options.ignore(file)
   && (!/\.html$/.test(file) || this.options.router.some(item => item.file.indexOf(file) > -1)))
    .map(file => /\.html$/.test(file) ? this.options.router.find(item => item.file.indexOf(file) > -1)).file
     : this.joinPath(this.options.assetsPublicPath, file))
}

SWPlugin.prototype.getVersion = function (files) {
  this.version = ''
}

SWPlugin.prototype.genHandlers = function () {
  let shouldFetchHandler = this.options.shouldFetch.toString()
  let nameHandler = this.options.nameType.toString()
  // let nameHandler = `url => {
  //   let map = (${this.options.nameType.toString()})(url).split('.');
  //   let urlObj = url.split(/\\/(?!\\/)/);
  //   let file = urlObj.pop().match(new RegExp(map.map(i => '([^.]*)').join('.')));
  //   let name = [];
  //   let hash = [];
  //   let ext = '';
  //   file.forEach((info, i) => {
  //     if (i > 0 && i < file.length - 1) {
  //       map[i - 1] === '[name]' ? name.push(info) : hash.push(info);
  //     } else if (i === file.length - 1) {
  //       ext = info;
  //     }
  //   })
  //   let baseUrl = urlObj.join('/');
  //   return { baseUrl, name, hash, ext }\n}`
  return {
    shouldFetchHandler, // return true or false
    nameHandler // return [name].[hash]
  }
}

SWPlugin.prototype.injectHtml = function (fileList) {
  return new Promise((resolve, reject) => {

  })
}

SWPlugin.prototype.genSwFile = function (fileList, handlers) {
  // fileList注入到html中，handlers，cacheId，router注入到sw中
  return new Promise((resolve, reject) => {
    fs.readFile(this.options.templatePath, (err, fd) => {
      if (err) reject(err)
      let str = `const cacheId = 'sw-plugin-${this.options.cacheId}';\n`
        + `const preFetch = [\n\t'${fileList.join(`', \n\t'`)}'\n];\n`
        + `${Object.keys(handlers).map(key => `const ${key} = ${handlers[key]}`).join(';\n')}\n`
      str += fd.toString()
      let filePath = this.joinPath(this.options.filepath, this.options.filename)
      fs.writeFile(filePath, str, err => err ? reject(err) : resolve())
    })
  })
}

SWPlugin.prototype.joinPath = function (pubPath, filePath) {
  pubPath = /\/$/.test(pubPath) ? pubPath.slice(0, -1) : pubPath
  return `${pubPath}${filePath[0] === '/' ? '' : '/'}${filePath}`
}

module.exports = SWPlugin
