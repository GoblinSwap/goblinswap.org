<template>
  <div id="app" class="app">
      <!-- <layout-side></layout-side> -->
      <!-- <keep-alive>
        <router-view v-if="$route.meta.keepAlive"> </router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"> </router-view> -->
    <div class="background_div"><img class="background_icon"  :src="imgUrl" alt=""></div>
    <div class="app_view"><router-view></router-view></div>
    
  </div>
</template>

<script>
// import layoutSide from '@/components/layoutSide'
export default {
  components: {
    // layoutSide
  },
   data () {
    return {
      imgUrl:require("@/assets/img/bg.jpg")
    }
  },
  methods: {},
};
</script>

<style lang="less">
// @import "assets/css/base.less";
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
p {
  margin: 0;
  padding: 0;
}
a {
  text-decoration: none;
}
div {
  box-sizing: border-box;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input[type="number"] {
  -moz-appearance: textfield;
}
button,
input,
optgroup,
select,
textarea {
  box-sizing: border-box;
  color: inherit;
  font: inherit;
  margin: 0;
  outline: none;
  border: none;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-width: 900px;
  background: #080c10;
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

.background_div {
  width: 100%;
}

@media screen and (min-width: 1920px) {
  .background_icon{
    position: absolute;
    top: 0px;
    left: 0%;
    width: 100%;
    min-width: 1200px;
 }
}
@media screen and (max-width: 1920px) {
 .background_icon{
    position: absolute;
    top: 0px;
    left: 0%;
    height: 100%;
    min-height: 900px;
 }
}


</style>
