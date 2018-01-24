<template lang="html">
  <div class="">
    <div class="item" v-for='(item, i) in list' :key='i'>
      {{i}}
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  computed: mapState(['list'])
}
</script>

<style lang="css">
</style>
