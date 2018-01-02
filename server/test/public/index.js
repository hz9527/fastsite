if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    function postMessage (msg) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(msg)
      }
    }
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('register successful', reg, navigator.serviceWorker)
        navigator.serviceWorker.addEventListener('message', e => {
          console.log(e, 'window receive message')
        })
        console.log(navigator.serviceWorker.controller)
        navigator.serviceWorker.addEventListener('install', e => {
          console.log('install', e)
        })
        navigator.serviceWorker.addEventListener('controllerchange', e => {
          console.log('controllerchange') // , e, navigator.serviceWorker.controller
        })
        // let mc = new MessageChannel()
        // mc.port1.onmessage = function (e) {
        //   console.log(1)
        // }
        setTimeout(postMessage, 2000, 'message from browser')
      }).catch(e => console.log(e))
  })
}

document.getElementById('add').onclick = function () {
  let script = document.createElement('script')
  document.body.appendChild(script)
  script.src = './test.js'
}
