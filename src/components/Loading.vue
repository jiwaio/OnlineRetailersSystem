<template>
  <div>
    <div class="loading1" v-if="loadType === 1">
      <img src="../../public/imgs/loading-svg/loading-spin.svg" alt="">
    </div>
    <div class="loading2" v-if="loadType === 2">
      <img src="../../public/imgs/loading-svg/loading-cubes.svg" alt="">
    </div>
    <div class="loading3" v-if="loadType === 3">
      <img src="../../public/imgs/loading-svg/loading-spokes.svg" alt="">
    </div>
  </div>
</template>

<script>
export default {
  name: "Loading",
  props: {
    loadType: {
      type: Number,
      // default:1
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss">
.loading1 {
  margin: 0 auto;
  height: 80px;
  line-height: 80px;
  text-align: center;
  padding: 30px 0;

  img {
    height: 100%;
  }
}

.loading2 {
  text-align: center;
}

.loading3 {
  //background-color: #545c64;
}
</style>