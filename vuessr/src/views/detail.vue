<template lang="html">
  <div class="page">
    {{detail}}
  </div>
</template>

<script>
import {getDetail} from '../api/index'
import {mapState} from 'vuex'
export default {
  asyncData (store, route, clear) {
    clear && store.commit('setDetail', {})
    let {owner, repo} = route.params
    return getDetail(owner, repo).then(res => {
      store.commit('setDetail', res)
    })
  },
  computed: mapState(['detail'])
}
</script>

<style lang="css">
</style>
