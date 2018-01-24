import Vue from 'vue'
import App from './views/app.vue'
import {createRouter} from './router/index'
import {createStore} from './store/index'

function createApp () {
  let router = createRouter()
  let store = createStore()
  let app = new Vue({
    router,
    store,
    render: h => h(App)
  })
  return {app, router, store}
}

export {createApp}
