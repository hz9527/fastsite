const express = require('express')
const https = require('https')
const fs = require('fs')
const privateKey = fs.readFileSync('./test.pem', 'utf8')
const certificate = fs.readFileSync('./certificate.pem', 'utf8')
const credentials = {key: privateKey, cert: certificate}
const gulp = require('./gulp.js')

const app = express()

app.use(express.static('./public'))

gulp()

const httpsServer = https.createServer(credentials, app)

httpsServer.listen(8088, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', 8088);
})
