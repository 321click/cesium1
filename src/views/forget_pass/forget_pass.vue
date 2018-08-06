<template>
  <div class="form-conts forget-container">
    <el-form :model="forgetForm" ref="forgetForm" :rules="forgetRules" class="form-box forget-box">
      <div class="login-tit"><span>忘记密码</span></div>
      <el-form-item prop="forgetTelNumber" class="inp-width">
        <el-input type="text" name="forgetTelNumber" v-model="forgetForm.forgetTelNumber" autoComplete="off"
                  placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item class="inp-width inp-code" prop="regCode">
        <el-input class="fl" type="text" v-model="forgetForm.regCode" name="regCode" autoComplete="off"
                  placeholder="请输入验证码"></el-input>
        <span class="fl fs12 get-code" v-show="sendForCode" @click="getForCode">获取验证码</span>
        <span class="fl fs12 resend-code" v-show="!sendForCode"><span class="fs14">{{auth_time}}s </span> 后重新发送</span>
      </el-form-item>
      <el-form-item prop="forgetPass" class="inp-width">
        <el-input type="password" name="forgetPass" v-model="forgetForm.forgetPass" autoComplete="off"
                  placeholder="请输入新密码"></el-input>
      </el-form-item>

      <el-form-item style="width:100%;">
        <el-button type="primary" style="width:100%;" @click.native.prevent="forgetSubmit" :loading="forLoad">提交
        </el-button>
      </el-form-item>

    </el-form>

  </div>
</template>

<script>
  var auth_timetimer; //倒计时
  export default {
    name: "forget_pass",
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
      //验证码校验
      const validateCode = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入验证码'));
        } else {
          callback()
        }
      };
      return {
        auth_time: 0,
        sendForCode: true,
        forLoad: false,
        forgetForm: {
          forgetTelNumber: '17625930165',
          //18351936998 /1qa2ws!QA@WS / 253247
          //徐超：18380160863
          forgetPass: '',
          regCode: ''
        },
        forgetRules: {
          forgetTelNumber: [{
            validator: ruleNumber,
            trigger: 'blur'
          }],
          forgetPass: [{
            validator: validatePass,
            trigger: 'blur'
          }],
          regCode: [{
            validator: validateCode,
            trigger: 'blur'
          }]
        }
      }
    },
    methods: {
      //获取验证码
      getForCode() {
        this.sendForCode = false;
        //设置倒计时秒
        this.auth_time = 60;
        var auth_timetimer = setInterval(() => {
          this.auth_time--;
          if (this.auth_time <= 0) {
            this.sendForCode = true;
            clearInterval(auth_timetimer);
          }
        }, 1000);
        var verCode = {
          messageType: messageType.SEND_VERIFY_SMS,
          data: {
            username: this.forgetForm.forgetTelNumber,
            msgType: msgType.FORGET_PASS
          }
        };
        this.$root.eventHub.$emit('responseNoCheck', verCode);
      },
      //提交
      forgetSubmit() {
        this.$refs.forgetForm.validate((valid) => {
          if (valid) {      //在验证通过时不返回callback()时  这一步进不来
            //this.forLoad = true;
            const userInfo = {
              messageType: messageType.USER_RESET_PASS,
              data: {
                username: '17625930165',
                password: this.forgetForm.forgetPass,
                verifyCode: this.forgetForm.regCode
              }
            };
            this.$root.eventHub.$emit('responseNoCheck', userInfo);
          } else {
            return false
          }
        });
      },
      //建立通信
      paramFun: function () {},
      //找回密码，返回的数据
      responseData(data) {
        var thisRes = this;
        var resCode = data.result.resultCode;
        //防止提示消息重复出现
        $('.el-message').hide();
        switch (resCode) {
          case msgResCode.VERIFYCODE_EXPIRED:
            thisRes.$message({
              message: "验证码不正确，请重新输入",
              type: 'warning',
              duration: 3000
            });
            thisRes.forLoad = false;
            break;
          case msgResCode.CODE_INCORRECT:
            thisRes.$message({
              message: "验证码不正确，请重新输入",
              type: 'warning',
              duration: 3000
            });
            break;
          case responseCode.SUCCESS_FULLY:
            thisRes.$message({
              message: "重置密码成功，正在前往登录页，请稍等...",
              type: 'success',
              duration: 3000
            });
            setTimeout(function () {
              thisRes.$router.push('/login');
            }, 3000);
            break;
        }
      },
      //发送验证码
      verifySmsFun: function (data) {
        var thisRes = this;
        var resCode = data.result.resultCode;
        //防止提示消息重复出现
        $('.el-message').hide();
        switch (resCode) {
          case responseCode.SUCCESS_FULLY:
            thisRes.$message({
              message: "发送成功",
              type: 'success',
              duration: 2000
            });
            break;
          case msgResCode.FREQUENT_VERIFICATION:
            thisRes.sendForCode = true;
            thisRes.$message({
              message: '您的验证过于频繁，请稍后再试',
              type: 'warning',
              duration: 3000
            });
            break;
        }
      }
    },
    mounted: function () {
      const thisObj = this;
      //ws链接建立
      thisObj.$root.eventHub.$on('wsOpen', this.paramFun);
      //监听返回数据
      //找回密码
      thisObj.$root.eventHub.$on('resetPass', this.responseData);
      //发送验证码
      thisObj.$root.eventHub.$on('verifySms', this.verifySmsFun);
    }

  }
</script>

<style lang="less" rel="stylesheet/less">
  @import "../../common/style/index";
  @import "../../common/style/login/login";
  .inp-code {
    .el-input {
      width: 50%;
    }
    .fs12 {
      margin-left: 14px;
    }
    .get-code {
      color: #409EFF;
      cursor: pointer;
    }
    .resend-code {
      color: #409EFF;
      span {
        color: #fff;
      }
    }
  }
  /*.forget-box{*/
  /*right: -2000px;*/
  /*}*/
  .forget-container .form-box {
    min-height: 310px!important;
  }
  .forget-container {
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
</style>
