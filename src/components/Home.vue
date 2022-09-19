<template>
  <el-container>
    <el-header>Header
      <span>欢迎您：{{ userInfo.username }}</span>
      <el-button type="primary" size="mini" plain icon="el-icon-switch-button" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="!isCollapse ? '200px':'64px'">
        <el-row class="tac">
          <el-col :span="24">
            <!-- 切换菜单的折叠和显示 -->
            <div class="toggle-button" @click="isCollapse = !isCollapse">|||</div>
            <!-- unique-opened 只显示当前项，:default-active 当前激活菜单 根据唯一标识 index collapse 是否水平折叠收起菜单  -->
            <Loading v-if="loading" :loadType="loadType = 2"></Loading>
            <el-menu
                router
                :default-active=$route.path
                unique-opened
                :collapse=isCollapse
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b">
              <!-- 一级菜单 index 唯一标识 menu加router 后会跳转到唯一标识 -->
              <el-submenu :index="nav.id+''" v-for="(nav, index) in menuList" :key="index">
                <template slot="title">
                  <i :class="iconObj[nav.id]"></i>
                  <span slot="title">{{ nav.authName }}</span>
                </template>
                <!-- 二级菜单 index 唯一标识  -->
                <el-menu-item :index="'/'+childNav.path" v-for="(childNav , index) in nav.children" :key="index">
                  <i class="el-icon-menu"></i> {{ childNav.authName }}
                </el-menu-item>
              </el-submenu>
            </el-menu>
          </el-col>
        </el-row>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from "axios"
import Loading from "../components/Loading"

export default {
  name: "home",
  components: {
    Loading
  },
  data() {
    return {
      //是否显示loading
      loading: true,
      userInfo: {},
      menuList: [],
      isCollapse: false,
      //一级菜单图标
      iconObj: {
        '201': "el-icon-s-home",
        "125": "el-icon-user-solid",
        "103": "el-icon-lock",
        "101": "el-icon-s-goods",
        "102": "el-icon-document"
      }
    }
  },
  methods: {
    //当用户点击退出
    logout() {
      this.$confirm('确定退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '退出成功!',
          //删除sessionStorage
        });
        sessionStorage.clear();
        this.$router.push("login");
      }).catch(() => {
      });
    },
    //获取菜单列表
    async getMenuList() {
      const {data: res} = await axios.get("menus");
      this.menuList = res;
      this.loading = false;
    }
  },
  created() {
    this.getMenuList();
    this.userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
  }
}
</script>

<style lang="scss">
@import "src/assets/scss/global";

.el-container {
  width: 100%;
  height: 100%;
}

.el-header, .el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  overflow: hidden;
  background-color: #545c64;
  color: #333;
  /*text-align: center;*/
  line-height: 200px;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
}

body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}

.toggle-button {
  background-color: #545c64;
  text-align: center;
  line-height: 30px;
  cursor: pointer;
  color: white;
  height: 30px;
  letter-spacing: 0.2rem;
}
</style>