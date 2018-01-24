const express = require('express')
const https = require('https')
const fs = require('fs')
const privateKey = fs.readFileSync('./test.pem', 'utf8')
const certificate = fs.readFileSync('./certificate.pem', 'utf8')
const credentials = {key: privateKey, cert: certificate}
const gulp = require('./gulp.js')
const logger = require('morgan')

const app = express()

const Dir = './public'
// const Dir = './dist'

app.use(logger('dev'))
app.use(express.static(Dir))


if (Dir === './dist') {
  gulp()
}

// const httpsServer = https.createServer(credentials, app)
//
// httpsServer.listen(8088, function() {
//     console.log('HTTPS Server is running on: https://localhost:%s', 8088);
// })
app.listen(18000, err => {
  console.log('server run in 18000')
})
