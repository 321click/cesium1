import Vue from 'vue';
//入口文件
import App from './App';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
//路由
import VueRouter from 'vue-router';
//路由配置文件
import routes from './router/routes';
//引入弹窗提示插件
import VueJsDialog from 'vuejs-dialog';
Vue.use(VueJsDialog);

//引入表单验证库
// import VeeValidate from 'vee-validate';

// import WebSock from './common/js/common';
// Vue.prototype.Common = WebSock;
// //初始化websocket
// Vue.prototype.webS = WebSock.commObj.initWebpack();


//引入公共弹窗
import '../static/dialog/js/dialog';
import '../static/dialog/css/dialog.css';
//引入公共样式
import './common/style/index.less';

Vue.use(ElementUI);
Vue.use(VueRouter);
// Vue.use(VeeValidate);
import axios from 'axios';
Vue.prototype.$http = axios; //请求的全局变量
Vue.prototype.HOST = '/api/';//请求的全局地址--设置config/index.js中的/api

//使用配置文件规则
const router = new VueRouter({
  // mode:'history',  //使用 HTML5 history 模式,该模式下没有#前缀
  routes:routes
});


//阻止 vue 在启动时生成生产提示
// Vue.config.productionTip = false;

//路由跳转前验证登录
// router.beforeEach((to, from, next) => {
//   if (to.path == '/login') {
//     //sessionStorage.removeItem('user');
//   }
//   let user = JSON.parse(sessionStorage.getItem('user'));
//   if (!user && to.path != '/login') {
//     next({ path: '/login' })
//   } else {
//     next()
//   }
// });

new Vue({
  router,
  render: h => h(App),
  data:{
    eventHub: new Vue() //给data添加一个名字为eventHub 的空vue实例,用来传输非父子组件的数据
  }
}).$mount('#app');

