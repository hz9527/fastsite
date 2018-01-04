const express = require('express')
const Vue = require('vue')
const Render = require('vue-server-renderer').createRenderer() // createRenderer createBundleRenderer

let app = express()

app.get('*', (req, res, next) => {
  const vue = new Vue({
    data: {
      url: req.url
    },
    created () {
      console.log('created')
    },
    mounted () {
      console.log('mounted')
    },
    template: `<div>current location is {{url}}</div>`
  })
  console.log('vue')
  Render.renderToString(vue, (err, html) => {
    if (err) {
      res.json({code: 500, message: 'err'})
      return
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="utf8">
        <head><title>Hello</title></head>
        <body>${html}</body>
      </html>
      `)
  })
})


app.listen(8089, err => {
  console.log(err, 'run 8089')
})
