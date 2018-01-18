const express = require('express')
const vue = require('vue')
const fs = require('fs')
const path = require('path')
const render = require('vue-server-renderer').createRenderer({
  template: fs.readFileSync(path.join(__dirname, './src/index.template.html'), 'utf-8')
})

const app = express()

function vueFactory (url) {
  return new vue({
    data () {
      return {
        url: url
      }
    },
    template: `<div>test:{{url}}</div>`
  })
}

app.get('*', (req, res, next) => {
  let app = vueFactory(req.url)
  render.renderToString(app, {title: 'testTitle'}, (err, html) => {
    if (err) {
      res.json({code: 500, codeMsg: 'error'})
    } else {
      res.send(html)
    }
  })
})

app.listen(18000, (err) => {
  if (err) {
    console.log('error: ', err)
    return
  }
  console.log('server run in port 18000')
})
