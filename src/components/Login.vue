<template>
  <div class="login-container">
    <div class="login-left">
      <img src="https://img.zcool.cn/community/0187d660fe60c311013eaf7075dba1.gif" alt="" id="loadings" v-if="!loading">
      <img src="../assets/imgs/login_img.png" v-if="loading" alt="">
    </div>
    <div class="login-box">
      <!-- 头像 -->
      <div class="avatar-box">
        <img src="../assets/imgs/login_logo.png" alt="">
        <!-- 标签 -->
        <div class="title">电商后台管理系统</div>
        <!-- 登录表单 -->
        <el-form ref="loginFormRef" class="login-from" :rules="loginFormRules" :model="form" validate="validate">
          <el-form-item prop="username">
            <el-input prefix-icon="el-icon-user-solid" placeholder="请输入用户名" v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input prefix-icon="el-icon-lock" show-password placeholder="请输入密码" v-model="form.password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="login">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
// import Loading from "@/components/Loading";
import axios from "axios"

export default {
  name: "Login",
  // components:{Loading},
  data() {
    return {
      loading: true,
      //输入的表单信息
      form: {
        username: "admin",
        password: "123456"
      },
      //表单校验规则
      loginFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    login() {
      this.loading = true;
      //判断表单校验是否成功 validate方法 返回回调(boolean,object)
      this.$refs.loginFormRef.validate(async (boolean) => {
        if (!boolean) {
          this.$message.warning("请正确输入");
        } else {
          //根据后端需要授权API，必须在请求头中使用 `Authorization` 字段提供的 token令牌
          const res = await axios.post('login', this.form)
          if (res.meta.status === 200) {
            this.$message.success(res.meta.msg)
            await this.$router.push("/home");
            //将用户信息存到sessionStorage
            sessionStorage.setItem("userInfo", JSON.stringify(res.data))
          } else {
            this.$message.error(res.meta.msg);
          }
        }
      })
    }
  }

}
</script>

<style lang="scss">
@import "src/assets/scss/config";
@import "src/assets/scss/global";

.login-container {
  width: 100%;
  height: 100%;
  background-color: $colorA;
  display: flex;
  justify-content: center;
  align-items: center;

  @keyframes move {
    0% {
      transform: translate(-200px, 0);
    }
    50% {
      transform: translate(300px, 0);
    }
    51% {
      transform: translate(300px, 0) scaleX(-1);
    }
    100% {
      transform: translate(-200px, 0) scaleX(-1);
    }

  }
  //
  .login-left {
    #loadings {
      //alternate
      animation: move 6s linear infinite;
      //transform: scaleX(-1);
      line-height: 500px;
      margin-right: 320px;
    }

    margin-right: 100px;
  }

  .login-box {
    width: 400px;
    height: 350px;
    background-color: #fff;
    padding: 50px;
    border-radius: 6px;
    box-sizing: border-box;
    position: relative;

    .avatar-box {
      width: 120px;
      height: 120px;
      border: 5px solid $colorA;
      border-radius: 100px;
      line-height: 150px;
      text-align: center;
      position: absolute;
      top: -60px;
      background-color: white;
      right: 140px;

      .title {
        width: 200px;
        position: absolute;
        top: 80px;
        left: 50%;
        font-size: 18px;
        color: #444;
        transform: translate(-50%);
      }

      .login-from {
        width: 300px;
        height: 200px;
        position: absolute;
        left: 50%;
        transform: translate(-50%);
        top: 200px;

        button {
          width: 100%;
        }
      }
    }
  }
}
</style>