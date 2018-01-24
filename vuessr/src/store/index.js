import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    state: {
      list: [],
      detail: {} // title content
    },
    mutations: {
      setList (state, list) {
        state.list = list
      },
      setDetail (state, detail) {
        state.detail = detail
      }
    }
  })
}
