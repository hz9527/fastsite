const Proxy = require('http-proxy-middleware')
module.exports = app => {
  console.log('app')
  app.use('/api', Proxy({
    target: 'https://api.github.com',
    changeOrigin: true,
    pathRewrite: path => path.replace('/api', '')
  }))
}
