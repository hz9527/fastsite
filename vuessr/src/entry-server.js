import {createApp} from './app'

export default context => {
  return new Promise(resolve => {
    let {router, store, app} = createApp()
    let result = router.resolve(context.url)
    console.log(result.route, context.url)
    // router.onReady(route => {
    //   console.log(route, 245)
    // })
    resolve(app)
  })
}
