// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// import * as OfflinePluginRuntime from 'offline-plugin/runtime'

// OfflinePluginRuntime.install()

Vue.config.productionTip = false
console.log(navigator.serviceWorker)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
