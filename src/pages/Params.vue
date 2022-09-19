<template>
  <div class="params">
    <!-- 商品管理 参数分类 -->
    <!--  面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图  -->
    <el-card>
      <el-alert style="margin: 0 0 20px 0" :closable="false" type="warning" title="注意：只允许第三级分类设置相关参数"></el-alert>
      <span style="font-size: 16px">选中商品分类：</span>
      <el-cascader
          v-model="currentSort"
          :options="getAllList"
          :props="cascaderProps"
          @change="handleChange"
          style="width: 300px;"
          :clearable="true"
      ></el-cascader>
      <!--  tab标签  -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!--  动态参数  -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="currentSort.length === 0" @click="addDialogVisible = true">
            添加参数
          </el-button>
          <el-table
              border
              :data="moveTableData"
              style="width: 100%">
            <el-table-column label="明细" type="expand">
              <template slot-scope="scope">
                <el-tag
                    v-for="(tag,index) in scope.row.attr_vals"
                    :key="index"
                    closable
                    :disable-transitions="false"
                    @close="tagHandleClose(scope.row.attr_vals[index])"
                    class="el-tag"
                >
                  {{ tag }}
                </el-tag>
                <!--     @keyup.enter.native="handleInputConfirm"
                                  @blur="handleInputConfirm"         -->
                <el-input
                    class="input-new-tag"
                    v-if="scope.row.showInput"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm"
                    @blur="handleInputConfirm"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInputFun(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column prop="date" label="操作">
              <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" content="编辑参数" placement="top" :enterable="false">
                  <el-button type="primary" icon="el-icon-edit" size="mini"
                             @click="editmoveDialog(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除参数" placement="top" :enterable="false">
                  <el-button type="danger" icon="el-icon-delete" size="mini"
                             @click="deleteParams(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--  静态属性  -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="currentSort.length === 0" @click="addDialogVisible = true">
            添加属性
          </el-button>
          <el-table
              border
              :data="moveTableData"
              style="width: 100%">
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" content="编辑属性" placement="top" :enterable="false">
                  <el-button type="primary" icon="el-icon-edit" size="mini"
                             @click="editmoveDialog(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除属性" placement="top" :enterable="false">
                  <el-button type="danger" icon="el-icon-delete" size="mini"
                             @click="deleteParams(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数或属性对话框  -->
    <el-dialog
        :title="activeName === 'many' ? '添加参数':'添加属性'"
        :visible.sync="addDialogVisible"
        width="30%"
        :before-close="adddialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="activeName === 'many' ? '参数名称':'属性名称'" prop="attr_name">
          <el-input v-model="addForm.attr_name" :clearable="true" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>

    <!-- 修改参数或属性对话框  -->
    <el-dialog
        :title="activeName === 'many' ? '添加参数':'添加属性'"
        :visible.sync="editDialogVisible"
        width="30%"
        :before-close="adddialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item :label="activeName === 'many' ? '参数名称':'属性名称'" prop="attr_name">
          <el-input v-model="addForm.attr_name" :clearable="true" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "Params",
  data() {
    return {
      getAllList: [],
      //当前选中联级表单数组
      currentSort: [],
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover"
      },
      //当前标签页选中的name
      activeName: "many",
      //切换参数展示列表
      moveTableData: [],
      //添加参数对话框
      addDialogVisible: false,
      addForm: {
        attr_name: ""
      },
      addFormRules: {
        attr_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'},
          {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
        ]
      },
      //添加参数对话框
      editDialogVisible: false,
      editForm: {},
      editFormRules: {},
      //当前明细的内容
      attr_detail: []
    }
  },
  created() {
    this.getSortList()
  },
  methods: {
    //获取所有分类
    async getSortList() {
      let res = await this.axios.get("categories")
      this.getAllList = res.data
    },
    //获取静态或动态数据
    async getCurrentList() {
      if (this.currentSort.length !== 0) {
        let res = await this.axios.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: this.activeName
          }
        })
        this.moveTableData = res.data
        //对参数明细进行处理：按空格拆分为数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : []
          item.showInput = false //控制input的出现
          item.inputValue = ""  //文本框中输入的值
        })
      } else {
        this.moveTableData = [];
      }
    },
    //当级联框value值选中时触发
    handleChange() {
      this.getCurrentList()
    },
    //切换标签页 categories/:id/attributes
    handleClick() {
      this.getCurrentList()
    },
    //点击添加确定按钮
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.warning("请正确输入")
        }
        await this.axios.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        this.$message.success("添加属性成功");
        this.addDialogVisible = false;
        await this.getCurrentList();
        this.$refs.addFormRef.resetFields()
      })
    },
    //关闭添加参数或属性对话框
    adddialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //点击删除按钮
    deleteParams(scope) {
      this.$confirm(`此操作将永久删除该 ${scope.attr_name} ${this.activeName === "many" ? "参数" : "属性"}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await this.axios.delete(`categories/${this.cateId}/attributes/${scope.attr_id}`)
        await this.getCurrentList();
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    //点击修改参数或属性
    editmoveDialog(scope) {
      this.editForm = scope.data
      this.editDialogVisible = true
    },
    //确定修改属性
    editParams() {

    },
    //监听明细中tag标签关闭,删除明细
    tagHandleClose(scope) {
      console.log(scope);
    },
    //点击添加明细显示input
    showInputFun(item) {
      console.log(item.showInput);
      item.showInput = true
      this.moveTableData.forEach(list => {
        if (list.attr_name === item.attr_name) {
          list.showInput = true
        }
      });
      console.log(item.showInput);
    },
    handleInputConfirm() {
    },
  },
  computed: {
    cateId() {
      return this.currentSort.length === 3 ? this.currentSort[2] : null
    }
  },

}
</script>

<style scoped>
.el-tag {
  margin: 0 10px;
}

.button-new-tag {
  width: 150px;
}

.input-new-tag {
  margin-left: 10px;
  width: 200px;
}
</style>