<template>
  <div class="addgoods">
    <!--  面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图  -->
    <el-card>
      <el-alert title=添加商品信息 type="info" center show-icon style="margin: 5px 0">
      </el-alert>
      <el-steps :active="activename - 0" finish-status="success" :space="200" style="margin: 15px 200px">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
      </el-steps>
      <!--  标签页  -->
      <el-form :model="AddbaseForm" :rules="Addbaserules" ref="AddruleForm" label-width="100px"
               class="demo-ruleForm" label-position="top">
      <el-tabs tab-position="left" v-model="activename" :stretch="false" :before-leave="beforeTabLeave" @tab-click="tabClick">
        <el-tab-pane label="基本信息" name="0">
          <!--  基本信息添加表单  -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="AddbaseForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="AddbaseForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="AddbaseForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="AddbaseForm.goods_number"></el-input>
            </el-form-item>
            <!--  联级选择器  -->
            <el-cascader
                v-model="AddbaseForm.goods_cat"
                :options="goods_introduce"
                :props="cascaderProps"
                :clearable="true"
                @change="handleChange"></el-cascader>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <!--     复选框     -->
          <el-form-item v-for="item in manyData" :key="item.attr_id" :label="item.attr_name">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox v-for="(value,i) in item.attr_vals" :key="i" :label="value" border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item v-for="item in onlyDate" :key="item.attr_id" :label="item.attr_name">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <!--     上传图片 action图片需要上传的后台地址  on-preview预览图片时的回调
           on-remove移除时回调  file-list 文件列表 通过文件列表加载图片 list-type 图片外观-->
          <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
          :on-success="handleSuccess">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <quill-editor v-model="AddbaseForm.goods_introduce"/>
          <el-form-item>
            <el-button type="primary" @click="submitForm" style="margin-top: 20px">提交</el-button>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="完成" name="5"></el-tab-pane>
      </el-tabs>
      </el-form>
    </el-card>
<!--  图片预览对话框  -->
    <el-dialog
        title="图片预览"
        :visible.sync="PictureDialog"
        width="40%">
      <img :src="previewPath" alt="" style="width: 100%;">
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"
export default {
  name: "AddGoods",
  data() {
    return {
      activename: '0',
      //添加商品表单对象
      AddbaseForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        //商品所属分类的数组
        goods_cat: [],  //以逗号分隔的数组
        pics:[],  //图片的数组
        goods_introduce:"",
        attrs:[]
      },
      //联级选择器内容
      goods_introduce: [],
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      //校验规则
      Addbaserules: {
        goods_name: [{required: true, message: '请选择商品名称', trigger: 'blur'}],
        goods_price: [{required: true, message: '请选择商品价格', trigger: 'blur'}],
        goods_number: [{required: true, message: '请选择商品数量', trigger: 'blur'}],
        goods_weight: [{required: true, message: '请选择商品重量', trigger: 'blur'}]
      },
      //动态参数数据
      manyData:[],
      onlyDate:[],
      uploadURL:`http://www.tangxiaoyang.vip:8888/api/v2/upload`,
      //文件上传的请求头信息
      headerObj:{
        Authorization : JSON.parse(sessionStorage.getItem('userInfo')).token
      },
      PictureDialog:false,
      previewPath:""
    }
  },
  created() {
    this.getGoods_cat();
  },
  methods: {
    async getGoods_cat() {
      let res = await this.axios.get("categories")
      this.goods_introduce = res.data;
    },
    //联级选择器触发
    handleChange() {
      if (this.AddbaseForm.goods_cat.length !== 3) {
        this.AddbaseForm.goods_cat = []
      }
      //联级选择器有内容才能跳转标签页
    },
    //标签页tabs离开触发
    beforeTabLeave() {
      if (this.AddbaseForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      } else {
        this.$refs.AddruleForm.validate(valid => {
          if (!valid) {
            this.$message.warning("请正确输入商品信息！");
            return false;
          }
        })
      }
    },
    //点击标签页触发
    async tabClick() {
      //this.activename === '1' 时为商品参数
      if (this.activename === '1') {
        let res = await this.axios.get(`categories/${this.cateId}/attributes`, {params: {sel: 'many'}})
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : []
        })
        this.manyData = res.data
      } else if (this.activename === '2') {
        let res = await this.axios.get(`categories/${this.cateId}/attributes`, {params: {sel: 'only'}})
        this.onlyDate = res.data
      }
    },
    //点击图片时触发
    handlePreview(file) {
      this.PictureDialog = true
      this.previewPath = file.url
    },
    //移除图片
    handleRemove(file) {
      //获得需要删除的临时路径
      const filePath = file.response.data.tmp_path
      const i = this.AddbaseForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      this.AddbaseForm.pics.splice(i, 1)

    },
    //每当图片上传成功时 response中data有临时路径tmp_path和url地址
    handleSuccess(response) {
      this.AddbaseForm.pics.push({
        pic: response.data.tmp_path
      })
    },
    //添加商品
    submitForm() {
      this.$refs.AddruleForm.validate(async valid => {
        if (!valid) {
          this.$message.warning("请正确输入商品信息！");
          return;
        }
        //准备请求前的数据
        // this.AddbaseForm.goods_cat  不能改变级联选择器的类型
        //深克隆一份来提交 lodash 使用库
        const form =_.cloneDeep(this.AddbaseForm)
        //处理动态参数
        form.goods_cat = form.goods_cat.join(",")
        this.manyData.forEach(item => {
          form.attrs.push({
            attr_id:item.attr_id,
            attr_value:item.attr_vals.join(' ')
          })
        })
        //处理静态属性
        this.onlyDate.forEach(item => {
          form.attrs.push({
            attr_id:item.attr_id,
            attr_value:item.attr_vals
          })
        })
        //发送请求
        await this.axios.post("goods",form)
        console.log(form);
        this.$message.success("添加商品成功")

        // const res = await this.axios.post("goods")

      })
    },
  },
  computed: {
    cateId() {
      return this.AddbaseForm.goods_cat.length === 3 ? this.AddbaseForm.goods_cat[2] : null
    }
  }
}
</script>

<style scoped>
.el-checkbox{
  margin-right: 10px;
}
.ql-editor{
  min-height: 100px;
  margin-top: 20px;
}
</style>