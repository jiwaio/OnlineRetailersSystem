import Vue from 'vue'
import App from './App.vue'
import ElementUi from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
import axios from "axios";
import VueAxios from "vue-axios";
import router from "@/router";

//富文本插件
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
Vue.use(VueQuillEditor, /* { default global options } */)

Vue.use(VueAxios, axios)
Vue.use(ElementUi)

//全局注册第三方表格组件 ZkTable.name： 组件名称
import ZkTable from 'vue-table-with-tree-grid'

Vue.component("tree-table", ZkTable)

//地址全局设置
axios.defaults.baseURL = "http://www.tangxiaoyang.vip:8888/api/v2/"
//axios拦截所有请求，为请求头添加token

//工具库
import utils from "@/libs/utils";

Vue.prototype.$utils = utils

const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
if (userInfo) {
    axios.interceptors.request.use(config => {
        config.headers.Authorization = userInfo.token;
        return config;
    })
}

axios.interceptors.response.use(response => {
    if (response.data.meta.status >= 205) {
        return this.$message.error("网络请求失败");
    } else {
        return response.data;
    }
})

Vue.config.productionTip = false

new Vue({
    render: h => h(App),
    router
}).$mount('#app')
