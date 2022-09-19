<template>
  <div class="orders">
    <!--  面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图  -->
    <el-card>
      <!--  搜索和添加  -->
      <el-row>
        <el-col :span="8">
          <!--    clearable 自带清空文本 清空后触发@clear事件  @clear="getUserList"  -->
          <el-input placeholder="请输入内容" class="input-with-select" v-model="orderInfo.query" clearable
                    @clear="getOderInfo">
            <el-button slot="append" icon="el-icon-search" @click="getOderInfo"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" :offset='1'>
          <el-button type="primary">编辑订单</el-button>
        </el-col>
      </el-row>
<!--   表格   -->
      <el-table :data="goodsList.goods" style="width: 100%" border @expand-change="getOrderDetail">
        <el-table-column type="expand" label="明细" width="120px">
          <template slot-scope="scope">
            <el-table :data="scope.row.detail" border>
              <el-table-column label="封面" width="120px">
              <template slot-scope="scope">
                <el-popover
                    placement="top-start"
                    trigger="hover"
                    content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
                  <img :src="scope.row.url" alt="商品封面" style="width: 150px;">
                  <img :src="scope.row.url" alt="商品封面" slot="reference" style="width: 100px;">
                </el-popover>
              </template>
              </el-table-column>
              <el-table-column label="商品名称" prop="goods_name" ></el-table-column>
              <el-table-column label="商品重量" prop="goods_weight" width="100px"></el-table-column>
              <el-table-column label="商品数量" prop="goods_number" width="100px"></el-table-column>
              <el-table-column label="商品价格（元）" prop="goods_price" width="100px"></el-table-column>
              <el-table-column label="商品总价" prop="goods_total_price" width="100px"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格（元）"></el-table-column>
        <el-table-column prop="is_send" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" effect="dark" v-if="scope.row.order_pay">已付款</el-tag>
            <el-tag type="danger" effect="dark" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间"></el-table-column>
        <el-table-column prop="date" label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑订单" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(scope.row.order_id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配用户" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--  分页条   :current-page="currentPage4" -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[5, 10, 15, 20]"
          :current-page="goodsList.pagenum - 0"
          :page-size="goodsList.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="goodsList.total">
      </el-pagination>
    </el-card>

    <!-- 编辑地址对话框 -->
    <el-dialog
        title="修改收货地址"
        :visible.sync="editDialog"
        width="30%"
        :before-close="handleClose">
      <el-form :model="editForm" :rules="editFormrules" ref="editRuleForm" label-width="100px" class="demo-ruleForm">
        <!-- 省市区级联选择器 -->
        <el-form-item label="省市区/县" prop="Address">
          <el-cascader
              v-model="editForm.Address"
              :options="citydata"
              :props="{expandTrigger:'hover'}"
              style="width: 100%;"
              ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="editForm.detailAddress"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialog = false">取 消</el-button>
    <el-button type="primary" @click="editAddress">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from "@/libs/citydata";
export default {
  name: "Orders",
  data() {
    return {
      //订单列表
      orderInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      goodsList:{},
      getUserList: "",
      editDialog: false,
      citydata:[],
      editForm: {
        Address: [],
        detailAddress: ""
      },
      //修改地址校验
      editFormrules: {
        Address: [{ required: true, message: '请输入省市区/县地址', trigger: 'blur' }],
        detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      order_id:""
    }
  },
  created() {
    this.getOderInfo();
    this.citydata = citydata;
  },
  methods: {
    //获取订单列表
    async getOderInfo(){
      let res = await this.axios.get("orders",{params:this.orderInfo})
      res.data.goods.forEach(goods => {
        goods.create_time = this.$utils.formToTime(goods.create_time)
        //为订单对象添加detail对象
        goods.detail = []
      })
      this.goodsList = res.data;
      console.log(this.goodsList);
    },
    //点击编辑按钮
    openEditDialog(scope) {
      this.editDialog = true
      this.order_id = scope
    },
    //确定修改地址
    async editAddress(){
      this.$refs.editRuleForm.validate(valid =>{
        if(!valid) {
          this.$message.warning("请正确输入地址")
          return
        }
      })
      let res = await this.axios.put(`orders/${this.order_id}/address`)
      console.log(res);
      this.editDialog = false
    },
    //关闭编辑按钮
    handleClose() {
      this.editDialog = false
    },
    //分页条
    handleSizeChange(pagesize){
       this.orderInfo.pagesize = pagesize
       this.getOderInfo();
    },
    handleCurrentChange(pagenum){
      this.orderInfo.pagenum = pagenum
      this.getOderInfo();
    },
    //展开订单明细时展示
    async getOrderDetail(row){
      let res = await this.axios.get(`orders/${row.order_id}`)
      row.detail = res.data.goods
      // 获取订单下的商品详情
      for (const item of row.detail) {
        let res = await this.axios.get(`goods/${item.goods_id}`)
        //为商品对象响应式添加属性
        this.$set(item,"goods_name",res.data.goods_name)
        this.$set(item,"goods_weight",res.data.goods_weight)
        this.$set(item,"url",res.data.pics[0].pics_big_url)
      }
      console.log(row);
    }
  }
}
</script>

<style scoped>

</style>