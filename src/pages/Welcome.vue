<template>
  <div class="welcome">
    <!--  面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>欢迎页</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="content">
      <h3>前端开发实习生</h3>
      <p>姓名： 文颂仪</p>
      <p>联系电话： 18934338595</p>
      <p>邮箱： wsongyi2023@168.com</p>
      <p>毕业时间： 2023年</p>
      <p>学历： 本科</p>
    </el-card>

  </div>
</template>

<script>
export default {
  name: "Welcome"
}
</script>

<style scoped lang="scss">
.content{
  h3{
    font-size: 20px;
  }
  p{
    margin-top: 10px;
    font-size: 15px;
  }
}
</style>