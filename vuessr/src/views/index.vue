<template lang="html">
  <div class="" @click='goDetail'>
    <Item v-for='(item, i) in list' :data='item' :key='item.id'/>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import Item from '../components/item.vue'
import {getStars} from '../api/index.js'
export default {
  computed: mapState(['list']),
  components: {Item},
  asyncData (store, router, clear) {
    clear && store.commit('setList', [])
    return getStars().then(res => {
      store.commit('setList', res)
      return
    })
  },
  methods: {
    goDetail (e) {
      if ('name' in e.target.dataset) {
        let {name: owner, repo} = e.target.dataset
        if (owner && repo) {
          this.$router.push({name: 'detail', params: {owner, repo}})
        }
      }
    }
  }
}
</script>

<style lang="css">
</style>
