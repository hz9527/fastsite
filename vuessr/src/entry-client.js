import Vue from 'vue'
import {createApp} from './app'

let {router, store, app} = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}
router.onReady(() => {
  router.beforeResolve((to, from, next) => {
    if (from.name) {
      let components = router.getMatchedComponents(to)
      components.forEach(item => item.asyncData && item.asyncData(store, to, true))
    }
    next()
  })
  app.$mount('#app')
})
