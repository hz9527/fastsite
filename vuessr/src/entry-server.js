import {createApp} from './app'

export default context => {
  return new Promise(resolve => {
    let test = {a: 1, b: 2}
    context.state = test
    resolve(createApp(test))
  })
}
