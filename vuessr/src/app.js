import Vue from 'vue'
import App from './views/app.vue'

function createApp (text) {
  if (process.env.VUE_ENV === 'server') {
    App.asyncData(text)
  }
  return new Vue(App)
}

export {createApp}
