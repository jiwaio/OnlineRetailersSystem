<template>
  <!-- 角色列表 -->
  <div class="roles">
    <!--  面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片  -->
    <el-card>
      <el-button type="primary" @click="addVisible = true">添加角色</el-button>
      <el-table :data="rolesList" border>
        <el-table-column label="明细" type="expand">
          <template slot-scope="scope">
            <div>
              <!--  一级标签  -->
              <el-row :key="index" v-for="(roleName1,index) in scope.row.children"
                      :class="{ bdtop :index === 0 ,bdbottom : true,vcenter:true}"
                      type="flex" justify="center">
                <!--  第一列  -->
                <el-col :span="5">
                  <el-tag type="primary" closable> {{ roleName1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!--  第二列  -->
                <el-col :span="19">
                  <!--  第一行第一列  -->
                  <el-row :key="index" v-for="(roleName2,index) in roleName1.children"
                          :class="{bdtop : index !== 0 ,vcenter:true}">
                    <el-col :span="5">
                      <el-tag type="success" closable> {{ roleName2.authName }}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="19">
                      <el-tag type="warning" :key="index" v-for="(roleName3,index) in roleName2.children" closable>
                        {{ roleName3.authName }}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑角色" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialog(scope.row)">编辑</el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDialog(scope.row)">删除</el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showAllocDialog(scope.row)">分配权限
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框  -->
    <el-dialog
        title="添加角色信息"
        :visible.sync="addVisible"
        width="40%"
    >
      <el-form :model="addFrom"
               status-icon
               :rules="addFormRules"
               ref="addForm"
               label-width="80px">
        <el-form-item label="添加角色" prop="roleName">
          <el-input type="text" v-model="addFrom.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addFrom.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </el-form>
    </el-dialog>

    <!--  修改角色对话框  -->
    <el-dialog
        title="修改角色信息"
        :visible.sync="editVisible"
        width="40%"
        @close="this.editForm ={}"
    >
      <el-form :model="editForm"
               status-icon
               :rules="editFormRules"
               ref="editForm"
               label-width="80px"
      >
        <el-form-item label="添加角色" prop="roleName">
          <el-input type="text" v-model="editForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
        <el-button @click="editForm={};editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </el-form>
    </el-dialog>

    <!-- 分配权限对话框 @node-click="handleNodeClick" -->
    <el-dialog title="分配权限" :visible.sync="RightDialogVisible" width="50%" @close="rightList=[]; defaultKeys = [];">
      <el-tree :data="rightList"
               :props="treeProps"
               :show-checkbox="true"
               node-key="id"
               :default-expand-all="true"
               :default-checked-keys="defaultKeys"
               ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="RightClose">取消</el-button>
        <el-button type="primary" @click="allocRules">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      //获取全部角色列表
      rolesList: [],
      //添加角色
      addVisible: false,
      addFrom: {
        roleName: "",
        roleDesc: ""
      },
      addFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'},
          {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'},
          {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
        ],
      },
      //编辑角色
      editVisible: false,
      editForm: {
        roleName: "",
        roleDesc: ""
      },
      //校验表单
      editFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'},
          {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'},
          {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
        ],
      },
      //分配角色权限
      RightDialogVisible: false,
      //所有权限列表 tree
      rightList: [],
      //树形组件的属性绑定对象 props
      treeProps: {
        label: "authName",
        children: "children"
      },
      //默认选择数组id
      defaultKeys: [],
      //当前分配角色的id
      roleId: ""
    }
  },
  created() {
    this.getList();
  },
  methods: {
    //获得角色列表
    async getList() {
      let res = await this.axios.get("roles");
      this.rolesList = res.data;
    },
    //提交添加角色
    addRole() {
      this.$refs.addForm.validate(async valid => {
        if (!valid) {
          return this.$message.warning("请正确填写角色信息")
        }
        await this.axios.post("roles", this.addFrom);
        this.$refs.addForm.resetFields();
        await this.getList();
      })
    },
    //点击编辑角色按钮
    async editDialog(scope) {
      this.editVisible = true;
      await this.axios.get(`roles/${parseInt(scope.id)}`)
      this.editForm = scope;
    },
    //提交修改角色
    editRole() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) {
          return this.$message.warning("请正确编辑角色")
        }
        await this.axios.put(`roles/${parseInt(this.editForm.id)}`, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        });
        await this.getList();
        this.$message.success("修改角色成功");
        this.editForm = {};
        this.editVisible = false;
      })
    },
    //点击删除角色按钮
    deleteDialog(scope) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await this.axios.delete(`roles/${scope.id}`);
        this.$message.success("删除成功");
        await this.getList()
      }).catch(() => {
        this.$message.info("已取消删除")
      });
    },
    //显示分配权限对话框
    async showAllocDialog(scope) {
      this.RightDialogVisible = true;
      //获取所有权限列表
      let res = await this.axios.get("rights/tree")
      this.rightList = res.data;
      // 获取角色下所有三级权限id
      this.getLeafKeys(scope);
      this.roleId = scope.id
    },
    //获取角色下所有三级权限的id
    getLeafKeys(node) {
      //判断是否为三级权限
      if (!node.children) {
        return this.defaultKeys.push(node.id)
      }
      //如果不是三级权限，则递归
      node.children.forEach(item => {
        this.getLeafKeys(item)
      })
    },
    //提交分配角色
    async allocRules() {
      //当前所有选中的key 数组
      const keys = this.$refs.treeRef.getCheckedKeys().concat(this.$refs.treeRef.getHalfCheckedKeys())
      const idStr = keys.join(`,`);
      await this.axios.post(`roles/${this.roleId}/rights`, {rids: idStr})
      this.RightDialogVisible = false;
      await this.getList();
      this.$message.success("权限分配成功");
    },
    //关闭分配角色按钮
    RightClose() {
      this.rightList = [];
      this.defaultKeys = [];
      this.RightDialogVisible = false;
      this.roleId = "";
      this.$message.info("已取消此次角色分配")
    }
  }
}
</script>

<style scoped lang="scss">
.el-tag {
  margin: 8px;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.bdtop {
  border-top: 1px solid #eee;
}

.el-row {
  margin: 2px 0;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>