<template>
  <div class="wraps">
    <!--登录-->
    <div class="form-conts form-container">
      <el-form :model="loginForm" ref="loginForm" :rules="loginRules" class="form-box login-box">
        <div class="login-tit"><span>用户登录</span></div>
        <el-form-item prop="telNumber" class="inp-width">
          <el-input type="text" name="telNumber" v-model="loginForm.telNumber" autoComplete="off"
                    placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item prop="password" class="inp-width">
          <el-input type="password" name="password" v-model="loginForm.password" autoComplete="off"
                    placeholder="请输入6-25位密码"></el-input>
        </el-form-item>
        <!--滑动验证-->
        <div class="check-box hover-show">
          <div id="slip-check"></div>
        </div>
        <div class="fs12 pic-check">向右滑动完成验证</div>
        <!--记住、忘记密码-->
        <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
        <span class="fr fs14 forget-pass" @click="forgetPass">忘记密码？</span>
        <el-form-item style="width:100%;">
          <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit" :loading="logining">登录
          </el-button>
        </el-form-item>

        <div class="fs14 form-line">尚未注册账号?</div>

        <el-form-item class="reg-btn" style="width:100%;">
          <el-button style="width:100%;" @click.native.prevent="handleReg">注册 <i class="el-icon-d-arrow-right
"></i></el-button>
        </el-form-item>
      </el-form>

      <!--注册-->
      <!--<register-cont></register-cont>-->

      <!--忘记密码-->
      <!--<forget-pass></forget-pass>-->
    </div>


  </div>


</template>

<script>
  import $ from "jquery";
  import '../common/js/jquery-1.12.4.min';
  import encDec from '../common/js/common';
  //引入注册、忘记密码组件
  // import registerCont from './register/register';
  // import forgetPass from './forget_pass/forget_pass';

  // import { requestLogin } from '../api/api';
  export default {
    data() {
      //手机号验证
      const ruleNumber = (rule, value, callback) => {
        const myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (value === '') {
          callback(new Error('请输入手机号'));
        } else if (!myreg.test(value)) {
          callback(new Error('手机号格式不正确'));
        } else {
          callback();    //如果在验证通过后不添加callback()函数在验证时是条件会为false
        }
      };
      //密码验证
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else if (value.length < 6 || value.length > 25) {
          callback(new Error('请输入6-25位密码'));
        } else {
          callback()
        }
      };

      return {
        loginForm: {
          // telNumber:'18351936998',
          // password:'1qa2ws!QA@WS'
          telNumber: '',
          password: ''
        },
        loginRules: {
          telNumber: [
            {
              validator: ruleNumber,
              trigger: 'blur'
            }
          ],
          password: [
            {
              validator: validatePass,
              trigger: 'blur'
            }
          ]
        },
        checked: true,
        logining: false
      };
    },
    //注册组件
    // components:{
    //   registerCont,
    //   forgetPass
    // },
    methods: {
      //登录事件
      handleSubmit() {
        this.$refs.loginForm.validate((valid) => {
          if (valid) {  //在验证通过时不返回callback()时  这一步进不来
            if ($('.check-box').hasClass('hover-show')) {
              $('.pic-check').addClass('active');
              return;
            } else { //验证通过
              const userInfo = {
                messageType: messageType.USER_LOGIN,
                data: {
                  username: this.loginForm.telNumber,
                  // password:encDec.commObj.encrypt(this.loginForm.password)
                  password: this.loginForm.password
                }
              };
              console.log(userInfo)
              this.$root.eventHub.$emit('responseNoCheck', userInfo);
            }
          } else {
            return false
          }
        });
      },
      //注册
      handleReg() {
        $('.pic-check').removeClass('active');
        //重置验证
        this.$refs.loginForm.resetFields();
        this.$router.push('/register');
      },
      //忘记密码
      forgetPass: function () {
        $('.pic-check').removeClass('active');
        //重置验证
        this.$refs.loginForm.resetFields();
        this.$router.push('/forget_pass');
      },
      //设置cookie
      setCookie(c_name, c_pwd, exdays) {
        var exdate = new Date(); //获取时间
        exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays); //保存的天数
        //字符串拼接cookie
        window.document.cookie = "userName" + "=" + c_name + ";path=/;expires=" + exdate.toGMTString();
        window.document.cookie = "userPwd" + "=" + c_pwd + ";path=/;expires=" + exdate.toGMTString();
      },
      //读取cookie
      getCookie: function () {
        if (document.cookie.length > 0) {
          var arr = document.cookie.split('; ');
          for (var i = 0; i < arr.length; i++) {
            var arr2 = arr[i].split('=');
            //判断查找相对应的值
            if (arr2[0] == 'userName') {
              this.loginForm.telNumber = arr2[1]; //保存到保存数据的地方
            } else if (arr2[0] == 'userPwd') {
              this.loginForm.password = arr2[1];
            }
          }
        }
      },
      //清除cookie
      clearCookie: function () {
        this.setCookie("", "", -1); //修改2值都为空，天数为负1天就好了
      },
      //建立链接
      paramFun() {},
      //登录返回数据
      responseData(data) {
        encDec.commObj.clearSession();
        console.log('登录返回数据：');
        console.log(data);
        var thisRes = this;
        var resCode = data.result.resultCode;
        //防止提示消息重复出现
        $('.el-message').hide();
        switch (resCode) {
          case responseCode.CONCURRENT_ACCOUNT:
            thisRes.$message({
              message: "该用户已登录",
              type: 'warning',
              duration: 3000
            });
            break;
          case loginResCode.USER_NOT_EXIST:
            thisRes.$message({
              message: "该用户尚未注册，请您先注册",
              type: 'warning',
              duration: 3000
            });
            break;
          case loginResCode.USER_PASS_ERROR:
            thisRes.$message({
              message: "登录失败，密码错误",
              type: 'warning',
              duration: 3000
            });
            break;
          case responseCode.SUCCESS_FULLY: //登录成功
            if(thisRes.checked){ //记住密码
              thisRes.setCookie(thisRes.loginForm.telNumber,thisRes.loginForm.password,7);
            }else{
              thisRes.clearCookie();
            }
            encDec.commObj.setSession(thisRes.loginForm.telNumber,'',data.profileId);
            thisRes.$message({
              message: "登录成功，正在跳转，请稍等...",
              type: 'success',
              duration: 2000
            });
            setTimeout(function () {
              thisRes.$router.push('/real_time_monitoring');
            }, 2000);

            break;
        }
      }

    },
    mounted: function () {
      const thisObj = this;
      //引入滑动验证插件
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "../../static/verify/js/verify.js";
      $('html').append(script);

      //ws链接建立
      thisObj.$root.eventHub.$on('wsOpen', this.paramFun);
      //监听返回数据
      thisObj.$root.eventHub.$on('loginResData', this.responseData);
      //页面加载调用获取cookie值
      thisObj.getCookie();
    },

  }

</script>

<style lang="less" rel="stylesheet/less">
  @import "../../static/verify/css/verify_sty";
  @import "../common/style/index";
  @import "../common/style/login/login";

  //登录输入框的样式
  .form-container, .reg-container {
    .el-input__inner {
      height: 34px;
      line-height: 34px;
      background: rgba(0, 0, 0, 0.1);
      color: rgba(255, 255, 255, 0.8);
    }
    .el-checkbox {
      color: rgba(255, 255, 255, 0.7);
    }
    .el-checkbox__input.is-focus .el-checkbox__inner {
      border-color: transparent;
    }
    .el-checkbox__inner {
      width: 18px;
      height: 18px;
      .border-radius();
      background: rgba(255, 255, 255, 0.8);
      &::after {
        width: 4px;
        height: 9px;
        left: 5px;
        border-width: 2px;
      }
    }
  }

  //调整验证样式
  .verify-left-bar {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .verify-img-panel .verify-refresh {
    width: 30px;
    height: 30px;
    top: -1px;
  }

  .verify-img-out, .verify-sub-block {
    display: none;
  }

  .check-box {
    /*margin-bottom: 16px;*/
    position: relative;
    transition: all 1s;
    .verify-img-out {
      position: absolute;
      top: -156px;
      z-index: 100;
    }
  }

  .hover-show:hover {
    .verify-img-out, .verify-sub-block {
      display: block;
    }
  }

  //按钮样式
  .el-form-item {
    margin: 16px 0;
  }

  .reg-btn {
    .el-button {
      background: rgba(255, 255, 255, .8);
    }
  }
  .verify-msg{
    font-size: 12px;
  }
</style>
