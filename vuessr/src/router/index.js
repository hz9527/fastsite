import Vue from 'vue'
import VueRouter from 'vue-router'
const Index = () => import('../views/index.vue')
const Detail = () => import('../views/detail.vue')

Vue.use(VueRouter)

export function createRouter () {
  return new VueRouter({
    mode: 'history',
    routes: [
      {
        path: '/',
        name: 'index',
        component: Index
      },
      {
        path: '/detail/:owner/:repo',
        name: 'detail',
        component: Detail
      },
      {
        path: '*',
        redirect: '/'
      }
    ]
  })
}
