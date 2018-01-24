// if ('serviceWorker' in navigator) {
//   alert('support serviceWorker')
//   window.addEventListener('load', () => {
//     function postMessage (msg) {
//       if (navigator.serviceWorker.controller) {
//         navigator.serviceWorker.controller.postMessage(msg)
//       }
//     }
//     navigator.serviceWorker.register('./sw.js')
//       .then(reg => {
//         console.log('register successful', reg, navigator.serviceWorker)
//         navigator.serviceWorker.addEventListener('message', e => {
//           console.log(e, 'window receive message')
//         })
//         console.log(navigator.serviceWorker.controller)
//         navigator.serviceWorker.addEventListener('install', e => {
//           console.log('install', e)
//         })
//         navigator.serviceWorker.addEventListener('controllerchange', e => {
//           console.log('controllerchange') // , e, navigator.serviceWorker.controller
//         })
//         // let mc = new MessageChannel()
//         // mc.port1.onmessage = function (e) {
//         //   console.log(1)
//         // }
//         setTimeout(postMessage, 2000, 'message from browser')
//       }).catch(e => console.log(e))
//   })
// }

console.log(navigator.connection)

document.getElementById('add').onclick = function () {
  let script = document.createElement('script')
  document.body.appendChild(script)
  script.src = 'http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js'
}

if (!('Notification' in window)) {
  console.log('not support Notification')
} else {
  console.log(Notification.permission, 123)
  if (Notification.permission === 'granted') {
    let notification = new Notification('test', {body: 'test'})
    notification.onclick = e => {
      console.log(e)
    }
  } else if (Notification.permission === 'default') {
    Notification.requestPermission((permission) => {
      if (permission === 'denied') {
        console.log('denied')
      } else if (permission === 'granted') {
        console.log('granted')
      }
    })
  }
}
