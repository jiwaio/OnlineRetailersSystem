<template>
  <div>
    <Loading v-if="loading" :loadType="loadType = 1"></Loading>
    <!-- 用户 -->
    <!--  面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图  -->
    <el-card>
      <!--  搜索和添加  -->
      <el-row>
        <el-col :span="8">
          <!--    clearable 自带清空文本 清空后触发@clear事件    -->
          <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable
                    @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" :offset='1'>
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 自定义列模板 不能直接使用userList数据 使用作用域插槽slot-scope="scope" -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="updateStates(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!--      文字提示  -->
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑用户" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除用户" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUsers(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配用户" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="allocDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>
      <!-- 分页
      @current-change： 当前页码的改变
      @size-change：分页大小的展示，下拉框
      page-size: 每页展示多少条
      layout: 分页的布局
      -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1,2,5,10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 :visible.sync 对话框的显示或隐藏-->
    <el-dialog
        title="添加用户信息"
        :visible.sync="dialogVisible"
        width="40%"
    >
      <!--  添加用户表单  -->
      <el-form :model="addUsersForm"
               status-icon
               :rules="addUsersFormRules"
               ref="ruleForm"
               label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input type="text" v-model="addUsersForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input show-password v-model="addUsersForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" v-model="addUsersForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="mobile">
          <el-input type="text" v-model="addUsersForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
        <el-button @click="addDialogClose();dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUsers">确 定</el-button>
      </el-form>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="40%"
    >
      <!--  修改用户表单  -->
      <el-form :model="editUsersForm"
               status-icon
               :rules="editUsersFormRules"
               ref="editRuleForm"
               label-width="80px">
        <el-form-item label="用户名">
          <el-input type="text" v-model="editUsersForm.username" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" v-model="editUsersForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="mobile">
          <el-input type="text" v-model="editUsersForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
        <el-button @click="editDialogClose">取 消</el-button>
        <el-button type="primary" @click="editUsers">确 定</el-button>
      </el-form>
    </el-dialog>

    <!--  分配角色对话框  -->
    <el-dialog
        title="分配用户角色"
        :visible.sync="allocDialogVisible"
        width="40%"
    >
      <!--  分配用户角色  -->
      <el-form :model="editUsersForm"
               status-icon
               :rules="editUsersFormRules"
               ref="editRuleForm"
               label-width="80px"
               id="usersRoles">
        <p>当前的用户： {{ userInfo.username }}</p>
        <p>当前的角色： {{ userInfo.role_name }}</p>
        <!--        <el-form>-->
        <p>
          &nbsp; 选择角色： &nbsp;
          <el-select v-model="usersRoles" placeholder="请选择角色">
            <el-option
                v-for="item in rolesList"
                :key="item.value"
                :label="item.roleName"
                :value="item.id">
            </el-option>
          </el-select>
        </p>
        <el-button @click="userInfo = {};allocDialogVisible=false;usersRoles='' ">取 消</el-button>
        <el-button type="primary" @click="allocUsers">确 定</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import Loading from "../components/Loading"

export default {
  name: "Users",
  components: {Loading},
  data() {
    return {
      loading: true,
      //查询用户列表参数对象
      queryInfo: {
        query: '',
        pagenum: 1,  //页码
        pagesize: 5  //页数
      },
      //用户数据
      userList: [],
      List: [],
      total: 0,
      //添加对话框显示
      dialogVisible: false,
      //添加用户的表单
      addUsersForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //添加用户校验规则
      addUsersFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: "邮箱格式不正确", trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {pattern: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/, message: "手机号格式不正确", trigger: 'blur'}
        ]
      },
      //显示修改用户
      editDialogVisible: false,
      //修改用户表单
      editUsersForm: {
        email: "",
        mobile: ""
      },
      editUsersFormRules: {
        email: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: "邮箱格式不正确", trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {pattern: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/, message: "手机号格式不正确", trigger: 'blur'}
        ]
      },
      //显示分配角色弹框
      allocDialogVisible: false,
      userInfo: {},
      //角色列表
      rolesList: [],
      usersRoles: ""
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //获取用户信息
    async getUserList() {
      this.List = await this.axios.get("users", {params: this.queryInfo})
      this.userList = this.List.data.users
      this.total = parseInt(this.List.data.total);
      this.loading = false;
    },
    //改变页数大小，pagesize
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getUserList();
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getUserList();
    },
    //用户状态改变
    async updateStates(status) {
      let res = await this.axios.put(`users/${status.id}/state/${status.mg_state}`);
      if (res.status !== 200) {
        status.status.mg_state = !status.status.mg_state;
        this.$message.error("用户状态更新失败")
      }
      this.$message.success("用户状态更新成功")
    },
    //关闭对话框
    addDialogClose() {
      this.$refs.ruleForm.resetFields();
    },
    //  提交用户信息
    addUsers() {
      this.$refs.ruleForm.validate(async (boolean) => {
        if (!boolean) {
          this.$message.error("请正确输入");
          return;
        } else {
          let res = await this.axios.post('users', this.addUsersForm)
          if (res.meta.status === 201) {
            this.dialogVisible = false;
            await this.getUserList();
            this.$message.success("添加用户成功")
          } else {
            this.$message.error("添加用户失败")
          }
        }
      })
    },
    //点击编辑按钮
    async editDialog(scope) {
      //根据id用户信息
      let res = await this.axios.get(`users/${scope.id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败")
      }
      this.editUsersForm = res.data;
      this.editDialogVisible = true;
    },
    //修改用户
    editUsers() {
      this.$refs.editRuleForm.validate(async (boolean) => {
        if (!boolean) {
          this.$message.error("请正确输入")
        } else {
          let res = await this.axios.put(`users/${this.editUsersForm.id}`, {
            email: this.editUsersForm.email,
            mobile: this.editUsersForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$message.error("修改失败！")
            this.editDialogVisible = false;
          } else {
            this.$message.success("修改成功");
            this.editDialogVisible = false;
            await this.getUserList()
          }
        }
      })
    },
    //修改用户关闭按钮
    editDialogClose() {
      this.editUsersForm = {};
      this.editDialogVisible = false;
    },
    //删除用户信息
    deleteUsers(scope) {
      this.$confirm(`是否删除 ${scope.username} 用户?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let res = await this.axios.delete(`users/${scope.id}`);
        if (res.meta.status !== 200) {
          this.$message.error("删除失败");
          return;
        }
        await this.getUserList();
        this.$message.error("删除成功");
      }).catch(() => {
        this.$message.info("已取消删除");
      });
    },
    //点击分配角色
    async allocDialog(scope) {
      this.allocDialogVisible = true;
      this.userInfo = scope;
      //获取角色列表 roleName
      const res = await this.axios.get("roles")
      this.rolesList = res.data;
    },
    //点击确定按钮 users/:id/role
    async allocUsers() {
      if (this.usersRoles === "") {
        return this.$message.warning("请选择用户角色")
      }
      let res = await this.axios.put(`users/${this.userInfo.id}/role`, {rid: this.usersRoles});
      console.log(res);
      if (res.meta.status !== 200) {
        this.$message.error("修改角色失败");
      } else {
        this.$message.success("修改角色成功");
        this.usersRoles = "";
        await this.getUserList();
      }
      this.allocDialogVisible = false;
    }
  }
}
</script>

<style scoped lang="scss">
#usersRoles {
  p {
    margin: 12px 0;
  }
}
</style>