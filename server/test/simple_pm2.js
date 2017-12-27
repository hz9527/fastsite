const fs = require('fs')
const child_process = require('child_process')
const path = require('path')

let pm2 = {
  child: null,
  init: function () {
    this.child = child_process.fork('./index.js')
    this.child.on('close', (err, code) => {
      if (code === 'SIGTERM') {
        console.log('parent kill me')
      } else {
        console.log('no zuo no die')
      }
      this.child = null
      this.init()
    })
  },
  kill: function () {
    if (this.child) {
      process.kill(this.child.pid)
    }
  }
}
pm2.init()
fs.watch(path.resolve(__dirname, './'), (e, fname) => {
  if (fname === 'index.js') {
    if (pm2.child) {
      pm2.kill()
    } else {
      pm2.init()
    }
  }
})
