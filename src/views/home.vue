<template>
  <el-row class="container">
    <!--头部-->
    <el-col :span="24" class="header">
      <el-col :span="10" v-show="!collapsed" class="logo fs14">CEEWA CLOUD</el-col>
      <el-col :span="6">
        <div class="tools" @click.prevent="collapse">
          <i class="el-icon-menu"></i>
        </div>
      </el-col>
      <el-col :span="8" class="login-cli fr" v-show="show_userinfo">
        <router-link class="fs14 console-btn" to="/login">登录</router-link>
      </el-col>
      <el-col :span="8" class="userinfo fr" v-show="!show_userinfo">
        <el-dropdown trigger="hover">
          <span class="el-dropdown-link userinfo-inner"><img src="../assets/logo.png" alt="">{{sysUserName}}</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

      </el-col>
    </el-col>
    <!--中间内容-->
    <el-col :span="24" class="main">
      <!--左侧导航菜单-->
      <!--:class="collapsed?'menu-collapsed':'menu-expanded'" -->
      <aside class="menu-expanded" v-show="!collapsed">
        <el-menu :default-active="$route.path" id="menu-wid" class="el-menu-vertical-demo left-menu" @open="handleopen"
                 @close="handleclose" @select="handleselect"
                 unique-opened router v-show="!collapsed">
          <template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
            <el-submenu :index="index+''" v-if="!item.leaf">
              <template slot="title">
                <i :class="item.iconCls"></i>
                <span class="menu-tit">{{item.name}}</span>
              </template>
              <el-menu-item v-for="child in item.children" v-if="!child.hidden" :id="child.id" class="sec-menu" :index="child.path"
                            :key="child.path"><i :class="child.iconCls"></i>{{child.name}}
              </el-menu-item>
            </el-submenu>

            <!--没有二级菜单-->
            <el-menu-item class="sec-menu" v-if="item.leaf&&item.children.length>0" :index="item.children[0].path"><i
              :class="item.iconCls"></i>{{item.children[0].name}}
            </el-menu-item>

          </template>
        </el-menu>

      </aside>

      <!--右侧内容-->
      <section class="content-container" :class="collapsed?'':'paddLeft'">
        <div class="grid-content bg-purple-light">
          <el-col :span="24" class="breadcrumb-container">
            <!--<strong class="title">{{$route.name}}</strong>-->
            <el-breadcrumb separator="/" class="breadcrumb-inner">
              <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
                {{ item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="24" class="content-wrapper">
            <transition name="fade" mode="out-in">
              <router-view></router-view>
            </transition>
          </el-col>
        </div>
      </section>

    </el-col>


  </el-row>
</template>

<script>
  //import commObj from '../common/js/common';
  var clickOk = true;
  export default {
    name: "home",
    data() {
      return {
        collapsed: false,
        show_userinfo: true,
        sysUserName: sessionStorage.getItem('userName'),
      }
    },
    // mounted(){
    //   commObj.initWebpack();
    // },
    methods: {
      handleopen() {
        //console.log('handleopen');
      },
      handleclose() {
        //console.log('handleclose');
      },
      handleselect: function (a, b) {
        var thisObj = this;
        console.log(a)
        console.log(b)
        if('/device_list' == a){ //设备列表
          const profileId = sessionStorage.getItem('profileId');
          const dataObj = {
            messageType:messageType.QUERY_DEVICE_LIST,
            data:{
              deviceType : '1',
              profileId : profileId
            }
          };
          if(clickOk){ //只允许用户点一次
            //设置需要请求的数据的匹配信息并通过'params'与app通讯，主要依靠eventhub的转换
            thisObj.$root.eventHub.$emit('params', dataObj); // 传输点击的目标元素
            clickOk = false;
          }
          clickOk = false;
        }else if('/cesiumContainer'==a){//cesium3D 地球
            const proId = sessionStorage.getItem('profileId');
            console.log(proId);
            const cesiumObj = {
                messageType:messageType.QUERY_DEVICE_LIST,
                data:{
                    deviceType : '1',
                    profileId : proId
                }
            };
          if(clickOk){ //只允许用户点一次
            //设置需要请求的数据的匹配信息并通过'params'与app通讯，主要依靠eventhub的转换
            thisObj.$root.eventHub.$emit('params', cesiumObj); // 传输点击的目标元素
            clickOk = false;
          }
          clickOk = false;
        }
      },
      //退出登录
      logout: function () {
        var thisObj = this;
        this.$confirm('确认退出吗?', '提示', {
          //type: 'warning'
        }).then(() => {
          sessionStorage.removeItem('profileId');
          sessionStorage.removeItem('userName');
          thisObj.show_userinfo = false;
          window.location.reload();
          // thisObj.$router.push('/login');
        }).catch(() => {

        });
      },
      //折叠导航栏
      collapse: function () {
        this.collapsed = !this.collapsed;
        var uiwidth = document.getElementById('menu-wid');
        if (uiwidth.offsetWidth === 0) {
          uiwidth.style.width = "100%"
        }
      },
    },
    mounted() {
      const thisObj = this;
      //用户信息
      const profileId = sessionStorage.getItem('profileId');
      const user = sessionStorage.getItem('userName');
      if (profileId || user) {
        thisObj.show_userinfo = false;
        thisObj.sysUserName = user || '';
      }

      //点击左侧发送请求
      // $(document).on('click','#deviceCli',function () {
      //   const profileId = sessionStorage.getItem('profileId');
      //   const dataObj = {
      //     messageType:messageType.QUERY_DEVICE_LIST,
      //     data:{
      //       deviceType : '1',
      //       profileId : profileId
      //     }
      //   };
      //   if(clickOk){
      //     //设置需要请求的数据的匹配信息并通过'params'与app通讯，主要依靠eventhub的转换
      //     thisObj.$root.eventHub.$emit('params', dataObj); // 传输点击的目标元素
      //     clickOk = false;
      //   }
      //   clickOk = false;
      // });


    },
  }
</script>

<style scoped lang="less" rel="stylesheet/less">
  @import "../common/style/index";
  @import "../common/style/home/home";

  .el-dropdown-menu {
    margin: 5px 0;
    border: 1px solid #d1dbe5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .12);
    padding: 6px 0;
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
    min-width: 100px;
    .el-dropdown-menu__item {
      list-style: none;
      line-height: 36px;
      padding: 0 10px;
      margin: 0;
      cursor: pointer;
      text-align: center;
    }
  }

</style>
