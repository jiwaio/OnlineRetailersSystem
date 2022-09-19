<template>
  <div class="goods">
    <!--  商品列表  -->
    <!-- 用户 -->
    <!--  面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图  -->
    <el-card>
      <!--  搜索和添加  -->
      <el-row>
        <el-col :span="8">
          <!--    clearable 自带清空文本 清空后触发@clear事件    -->
          <el-input placeholder="请输入内容" class="input-with-select" v-model="goodsInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" :offset='1'>
          <router-link to="/goods/add" tag="el-button" type="primary" @click="dialogVisible = true">添加商品</router-link>
        </el-col>
      </el-row>

      <!--  商品表格  -->
      <el-table :data="goodsList.goods" style="width: 100%">
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="500"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）" width="180"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="180"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑用户" placement="top" :enterable="false">
              <router-link :to="`/goods/edit/${scope.row.goods_id}`">
                <el-button type="primary" icon="el-icon-edit" size="mini" style="margin-right: 10px"></el-button>
              </router-link>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除用户" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="goodsInfo.pagenum"
          :page-sizes="[5,10,15,20]"
          :page-size="goodsInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="goodsList.total"
      >
      </el-pagination>
      <!-- 商品列表 -->
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Goods",
  data() {
    return {
      //搜索表单绑定数据
      goodsInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      //商品总数
      goodsTotal: 0
    }
  },
  created() {
    this.getGoodList();
  },
  methods: {
    //获取商品信息
    async getGoodList() {
      let res = await this.axios.get('goods', {params: this.goodsInfo})
      res.data.goods.forEach(goods => {
        goods.add_time = this.$utils.formToTime(goods.add_time)
      })
      this.goodsList = res.data
      console.log(this.goodsList);
    },
    //点击改变分页条页数
    handleSizeChange(pagesize) {
      this.goodsInfo.pagesize = pagesize
      this.getGoodList();
    },
    //改变当前页
    handleCurrentChange(pagenum) {
      this.goodsInfo.pagenum = pagenum
      this.getGoodList();
    },
    //点击编辑按钮
    editGoods(scope) {
      // this.$router.push(`/goods/edit:${scope.goods_id}`)
      console.log(scope.goods_id);
    },
    //点击删除商品按钮
    deleteGoods(scope) {
      this.$confirm(`<p>此操作将永久删除该  <strong>${scope.goods_name}</strong>  商品</p>`, '删除商品', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await this.axios.delete(`goods/${scope.goods_id}`)
        this.goodsList()
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
    }
  }
}
</script>

<style scoped>

</style>