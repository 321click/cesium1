<template>

  <div class="cont-box" @click="consolePage">
    <el-row>
      <el-col :span="24" class="bg-show">
        <!--头部-->
        <div class="cont-top" v-bind:class="{is_opac:ishead_opac}">
          <div class="fl">
            logo
          </div>
          <ul class="fr menu-ul">
            <li class="fl">
              <!--<a href="#">控制台</a>-->
              <router-link class="fs14 console-btn" to="/real_time_monitoring">控制台</router-link>
            </li>
            <li class="fl login_link" v-show="show_userinfo">
              <router-link class="fs14 console-btn" to="/login">登录</router-link>
            </li>
            <li class="fl user-box" v-show="!show_userinfo">
              <el-dropdown trigger="hover">
                <span class="el-dropdown-link userinfo-inner"><i class="el-icon-success"></i><span class="user-name">{{sysUserName}}</span></span>
                <el-dropdown-menu slot="dropdown" class="user-drop">
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </li>
          </ul>
        </div>

        <div class="fs14 cont-detail">
          153
        </div>
        <div class="fs14 cont-footer">
          footer
        </div>

      </el-col>

    </el-row>

  </div>
</template>
<script>
  import commFun from '../common/js/common';
  export default {
    name: "index",
    data() {
      return {
        show_userinfo: true,
        ishead_opac: false,
        sysUserName: ''
      }
    },
    methods: {
      consolePage: function () {
        const thisObj = this;
        // thisObj.$router.push({path:'/real_time_monitoring'});
      },
      //退出登录
      logout: function () {
        var thisObj = this;
        thisObj.$confirm('确认退出吗?', '提示', {
          //type: 'warning'
        }).then(() => {
          const exitInfo = {
            messageType: messageType.EXIT_LOGON,
            data: {}
          };
          thisObj.$root.eventHub.$emit('responseNoCheck', exitInfo);
        }).catch(() => {

        });
      },
      handleScroll() {
        const thisObj = this;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        if (scrollTop > 10) {
          thisObj.ishead_opac = true;
        } else {
          thisObj.ishead_opac = false;
        }
      },
      //建立链接
      paramFun(){},
      //返回数据
      responseData(data){
        const thisRes = this;
        console.log('退出登录返回结果:');
        console.log(data);
        var resCode = data.result.resultCode;
        switch (resCode) {
          case responseCode.SUCCESS_FULLY:
            thisRes.$message({
              message: "退出登录成功",
              type: 'success',
              duration: 2000
            });
            setTimeout(function () {
              //清除缓存
              commFun.commObj.clearSession();
              thisRes.show_userinfo = false;
              window.location.reload();
            },2000);
            break;
        }
      }
    },
    mounted() {
      const thisObj = this;
      window.addEventListener('scroll', this.handleScroll);
      //用户信息
      const profileId = sessionStorage.getItem('profileId');
      const user = sessionStorage.getItem('userName');
      if (profileId || user) {
        thisObj.show_userinfo = false;
        thisObj.sysUserName = user || '';
      }
      //ws链接建立
      thisObj.$root.eventHub.$on('wsOpen', this.paramFun);
      //退出
      thisObj.$root.eventHub.$on('exitLogin', this.responseData);

    },

  }

</script>

<style scoped lang="less" rel="stylesheet/less">
  @import "../common/style/index";
</style>
