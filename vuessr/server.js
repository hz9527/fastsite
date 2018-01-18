const fs = require('fs')
const path = require('path')
const express = require('express')
const {createBundleRenderer} = require('vue-server-renderer')

let app = express()

let readyPromise = require('./build/setup-dev-server')(
  app,
  path.join(__dirname, './src/index.template.html'),
  (bundle, options) => {
    renderer = createBundleRenderer(bundle, options)
  }
)

function render (req, res) {
  // computed time
  let start = Date.now()
  console.log('ready render')
  res.setHeader('Content-Type', 'text/html')
  renderer.renderToString({title: 'test', url: req.url}, (err, html) => {
    res.send(html)
    console.log(Date.now() - start)
  })
}

app.get('/test', (req, res) => {
  readyPromise.then(() => {
    console.log('get request')
    render(req, res)
  }).catch(err => {
    console.log(err)
  })
})

app.listen(18000, err => {
  if (err) {
    console.log('error: ', err)
  } else {
    console.log('server is running in 18000')
  }
})
