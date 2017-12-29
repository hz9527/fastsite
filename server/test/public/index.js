if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('register successful')
        navigator.serviceWorker.addEventListener('message', e => {
          console.log(e, 'window receive message')
        })
        let mc = new MessageChannel()
        mc.port1.onmessage = function (e) {
          console.log(1)
        }
        // setTimeout(() => {
        //   console.log(navigator.serviceWorker.controller)
        //   navigator.serviceWorker.controller.postMessage('client to sw message', [mc.port2])
        // }, 500)
      }).catch(e => console.log(e))
  })
}
