import {createApp} from './app'

export default context => {
  return new Promise((resolve, reject) => {
    let {router, store, app} = createApp()
    let {fullPath} = router.resolve(context.url).route
    if (fullPath !== context.url) {
      console.log(404)
      return reject({url: fullPath})
    }
    router.push(context.url)
    router.onReady(route => {
      let components = router.getMatchedComponents(context.url)
      Promise.all(components.map(item => item.asyncData && item.asyncData(store, router.currentRoute)))
        .then(res => {
          context.state = store.state
          resolve(app)
        }).catch(err => {
          reject()
        })
    })
  })
}
