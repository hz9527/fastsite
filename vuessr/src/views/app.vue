<template lang="html">
  <div id="app" @click='handlerClick'>test{{text}}</div>
</template>

<script>
import {change, store} from '../store/index'
export default {
  data () {
    return {
      text: ''
    }
  },
  asyncData (test) {
    change(test)
  },
  created () {
    console.log('created', store)
    this.text = store
  },
  methods: {
    handlerClick () {
      console.log(123)
      this.text += Math.random().toString(36).slice(2)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
