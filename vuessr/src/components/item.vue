<template lang="html">
  <div class="item" v-show='data.owner'>
    仓库名称：{{data.name}}
    作者：{{data.owner && data.owner.login}}
    <span :data-name='(data.owner && data.owner.login)'
      :data-repo="data.name">查看详情</span>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default () {
        return {}
      }
    }
  }
}
</script>

<style lang="css">
  .item {
    display: inline-block;
    padding: 5px;
    margin: 10px 5px;
    border: 1px solid #f55;
  }
  .item span {
    color: #f55;
    cursor: pointer;
  }
</style>
