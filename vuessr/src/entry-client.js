import Vue from 'vue'
import {createApp} from './app'

Vue.mixin({
  beforeMount () {
    console.log('before mount', window.__INITIAL_STATE__.toString())
    if ('text' in this) {
      this.text = window.__INITIAL_STATE__
    }
  }
})
let app = createApp()
app.$mount('#app')
