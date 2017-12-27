if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function (reg) {
        console.log('register successful', reg)
      }).catch(function (err) {
        console.log('register fail', err)
      })
  })
} else {
  console.warn('serviceWorker is not supported by your browser');
}
