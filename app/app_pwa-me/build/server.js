const express = require('express');
const app = express();
const staticApp = express();
const path = require('path');
const appPort = 9000;
const staticPort = 18000;

app.use(express.static(path.join(__dirname, '../dist')))

// staticApp.all('*', function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
//   res.header('Access-Control-Allow-Methods', 'GET');
//   next();
// })

staticApp.use(express.static(path.join(__dirname, '../staticServer')))

app.listen(appPort, err => {
  if (err) {
    console.log(err)
  } else {
    console.log(`server run in port ${appPort}`)
  }
})

staticApp.listen(staticPort, err => {
  if (err) {
    console.log(err)
  } else {
    console.log(`server run in port ${staticPort}`)
  }
})