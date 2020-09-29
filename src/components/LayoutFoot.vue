<template>
  <div class="layout_foot">
    <div class="foot_view">
      <div class="foot_item"><a href="https://goblinswap.gitbook.io/goblin-docs/" target="_blank">{{this.$t('swap.swap4')}}</a></div>
      <div class="foot_item"><a href="https://twitter.com/goblinswap" target="_blank">{{this.$t('swap.swap5')}}</a></div>
      <div class="foot_item"><a href="https://t.me/Goblinswap_Official" target="_blank">{{this.$t('swap.swap6')}}</a></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.foot_view {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  // position: fixed;
  // bottom: 0;
  // width: 100%;
  .foot_item {
    padding: 0px 24px;
    height: 45px;
    line-height: 45px;
    a{
      display: inline-block;
      width: 100%;
      font-size: 14px;
      font-weight: 500;
      color: #ffffff;
    }
  }
}
</style>
