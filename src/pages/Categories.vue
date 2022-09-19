<template>
  <div class="categories">
    <!-- 分类参数 -->
    <!--  面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图  -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="addSortForm" id="addbtn">添加分类</el-button>
      </el-row>
      <!--   树形组件   -->
      <tree-table border :data="cateList" :columns="columns " :selection-type="false" :expand-type="false"
                  :show-index="true">
        <template slot="isOK" slot-scope="scope">
          <i class="el-icon-success" style="color: green" v-if="scope.row.cat_deleted"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <template slot="operate" slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialog(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUsers(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>

    <!--  添加分类对话框  -->
    <el-dialog
        title="添加分类"
        :visible.sync="addDialogVisible"
        width="40%"
        @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFromrules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name" :clearable="true"></el-input>
        </el-form-item>
        <el-form-item label="父类级别" prop="cat_level">
          <el-cascader label-width="100px"
                       v-model="selectedKeys"
                       :options="ParentCateList"
                       :props="cascaderProps"
                       :clearable="true"
                       @change="handleChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
    </el-dialog>

    <!--  编辑分类对话框  -->
    <el-dialog
        title="编辑分类"
        :visible.sync="editDialogVisible"
        width="40%"
        @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFromrules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name" :clearable="true"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Categories",
  data() {
    return {
      //查询分类列表的参数对象
      queryInfo: {
        //type 3 获取第三层数据
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //分类列表
      cateList: [],
      //总记录数
      total: 0,
      //tree-table 的列定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          //当前列为自定义模板列
          type: "template",
          //当前列使用的模板名称
          template: "isOK"
        },
        {
          label: "排序",
          //当前列为自定义模板列
          type: "template",
          //当前列使用的模板名称
          template: "order"
        },
        {
          label: "排序",
          //当前列为自定义模板列
          type: "template",
          //当前列使用的模板名称
          template: "operate"
        },
      ],
      //添加用户对话框
      addDialogVisible: false,
      addForm: {
        cat_name: "", //分类的名称
        cat_pid: 0, //分类的父ID
        cat_level: 0,  //0,1,2 分类的层级
      },
      addFromrules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'},
          {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
        ]
      },
      //一级二级列表
      ParentCateList: [],
      //级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: true
      },
      //级联选择器选中的值的value 数组
      selectedKeys: [],
      //编辑按钮
      editDialogVisible: false,
      editForm: {
        cat_name: ""
      },
      editFromrules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'},
          {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      //res 为获取第三层数据
      let res = await this.axios.get("categories", {
        params: this.queryInfo
      })
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    //点击几条一页触发
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getCateList();
    },
    //点击当前页触发
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getCateList();
    },
    //获取父级（一二级）的数据列表
    async getParentCateList() {
      let res = await this.axios.get("categories", {params: {type: 2}});
      this.ParentCateList = res.data
    },
    //点击添加分类显示
    addSortForm() {
      this.addDialogVisible = true;
      this.getParentCateList();
    },
    //级联选择器@change触发，当value改变时
    handleChange() {
      // console.log(this.selectedKeys);  为一个value的数组
      let KeysL = this.selectedKeys.length
      if (KeysL > 0) {
        this.addForm.cat_pid = this.selectedKeys[KeysL - 1]
        this.addForm.cat_level = KeysL
      } else {
        this.addForm.cat_pid = 0;
        this.addForm.cat_level = 0;
      }
    },
    //点击添加分类确定
    addCate() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        await this.axios.post("categories", this.addForm)
        this.addDialogVisible = false;
        await this.getCateList();
        this.$message.success("添加分类成功")
      })
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    //点击编辑分类按钮
    editDialog(scope) {
      this.editDialogVisible = true
      this.editForm = scope;
      console.log(scope);
    },
    //点击确定编辑
    editCate() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.warning("请正确输入分类名称")
        }
        this.editDialogVisible = false;
        await this.axios.put(`categories/${this.editForm.cat_id}`, {cat_name: this.editForm.cat_name})
        this.$message.success("修改分类名称成功");
        this.editForm = {}
        await this.getCateList();
      })
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
      this.editForm = {}
    },
    //点击删除分类按钮
    deleteUsers(scope) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '删除分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await this.axios.delete(`categories/${scope.cat_id}`)
        this.$message.success('删除成功!');
        await this.getCateList();
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    }
    ,
  }
}
</script>

<style scoped>
.el-result__icon {
  width: 1px;
}

.el-cascader {
  width: 100%;
}

#addbtn {
  margin: 10px 0;
}
</style>