<template lang="html">
  <div id="app">
    index
    <router-link :to="{name: 'detail', params: {id: 123}}">detail</router-link>
    <router-view/>
  </div>
</template>

<script>
export default {
  asyncData (test) {
  }
}
</script>

<style lang="css" scoped>
</style>
