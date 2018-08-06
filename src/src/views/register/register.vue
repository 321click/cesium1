<template>
  <div class="form-conts reg-container">
    <el-form :model="regForm" ref="regForm" :rules="regRules" class="form-box reg-box">
      <div class="login-tit"><span>用户注册</span></div>
      <el-form-item prop="regTelNumber" class="inp-width">
        <el-input type="text" name="regTelNumber" v-model="regForm.regTelNumber" autoComplete="off" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item prop="regPass" class="inp-width">
        <el-input type="password" name="regPass" v-model="regForm.regPass" autoComplete="off" placeholder="请输入6-25位密码"></el-input>
      </el-form-item>
      <el-form-item class="inp-width inp-code" prop="regCode">
        <el-input class="fl reg-code" type="text" v-model="regForm.regCode" name="regCode" autoComplete="off" placeholder="请输入验证码"></el-input>
       <!--v-model="verification"-->
        <span class="fl fs12 get-code" v-show="sendCode" @click="getCode">获取验证码</span>
        <span class="fl fs12 resend-code" v-show="!sendCode"><span class="fs14">{{auth_time}}s </span> 后重新发送</span>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button type="primary" style="width:100%;" @click.native.prevent="regSubmit" :loading="regLoad">立即注册</el-button>
      </el-form-item>

      <div class="fs14 form-line">已有账号</div>
      <el-form-item class="reg-btn" style="width:100%;">
        <el-button style="width:100%;" @click.native.prevent="handleLoad">
          <i class="el-icon-d-arrow-left"></i>
          登录
        </el-button>
      </el-form-item>

    </el-form>

  </div>
</template>

<script>
  import encDec from '../../common/js/common';
  export default {
    name: "register",
    data(){
      //手机号验证
      const ruleNumber = (rule, value, callback) => {
        const myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (value === '') {
          callback(new Error('请输入手机号'));
        } else if(!myreg.test(value)) {
          callback(new Error('手机号格式不正确'));
        }else {
          callback();    //如果在验证通过后不添加callback()函数在验证时是条件会为false
        }
      };
      //密码验证
      const validatePass = (rule, value, callback) => {
        if(value === ''){
          callback(new Error('请输入密码'));
        }else if (value.length < 6 || value.length > 25) {
          callback(new Error('请输入6-25位密码'));
        } else {
          callback()
        }
      };
      //验证码校验
      const validateCode = (rule, value, callback) => {
        if(value === ''){
          callback(new Error('请输入验证码'));
        }else {
          callback()
        }
      };
      return{
        sendCode:true,
        auth_time:0, //倒计时
        regLoad:false,
        regForm:{
          //18351936998
          regTelNumber:'17625930165',
          regPass:'123456',
          regCode:''
        },
        regRules:{
          regTelNumber:[
            {
              validator: ruleNumber,
              trigger: 'blur'
            }
          ],
          regPass:[
            {
              validator:validatePass,
              trigger:'blur'
            }
          ],
          regCode:[{
            validator:validateCode,
            trigger:'blur'
          }]
        },
      }
    },
    methods:{

      //  获取验证码
      getCode:function () {
        this.sendCode = false;
        //设置倒计时秒
        this.auth_time = 60;
        const auth_timetimer = setInterval(()=>{
          this.auth_time--;
          if(this.auth_time<=0){
            this.sendCode = true;
            clearInterval(auth_timetimer);
          }
        }, 1000);
        var verCode = {
          messageType:messageType.SEND_VERIFY_SMS,
          data:{
            username:this.regForm.regTelNumber,
            msgType : msgType.REGISTER_CODE
          }
        };
        this.$root.eventHub.$emit('responseNoCheck',verCode);

      },

      //注册
      regSubmit:function () {
        // this.regLoad = true;
        var thisReg = this;
        this.$refs.regForm.validate((valid) => {
          if (valid) {      //在验证通过时不返回callback()时  这一步进不来
            this.logining = true;
            const userInfo = {
              messageType:messageType.USER_REGIST,
              data:{
                // username:this.regForm.regTelNumber,
                // password:encDec.commObj.encrypt(this.regForm.regPass),
                // username: '18351936998',
                // password: '1qa2ws!QA@WS',
                username: '17625930165',
                password: '123456',
                accountType : 1, //用户类型：1表示企业用户；2表示个人用户
                verifyCode:this.regForm.regCode
              }
            };
            this.$root.eventHub.$emit('responseNoCheck',userInfo);
          } else {
            return false
          }
        });
      },
      //去登陆
      handleLoad:function () {
        //重置验证
        this.$refs.regForm.resetFields();
        this.$router.push('/login');
      },
      //输入框失去焦点
      changeCount:function(){

      },
      //建立通信
      paramFun:function () {},
      //注册时,返回数据
      responseData(data){
        var thisRes = this;
        var resCode = data.result.resultCode;
        //防止提示消息重复出现
        $('.el-message').hide();
        switch (resCode){
          case msgResCode.USER_EXISTED:
            thisRes.$message({
              message:"该用户已注册，请直接登录",
              type: 'warning',
              duration:3000
            });
            break;
          case msgResCode.CODE_INCORRECT:
            thisRes.$message({
              message:"验证码不正确，请重新输入",
              type: 'warning',
              duration:3000
            });
            break;
          case responseCode.SUCCESS_FULLY:
            thisRes.$message({
              message:"注册成功，正在前往登录页，请稍等...",
              type: 'success',
              duration:3000
            });
            setTimeout(function () {
              thisRes.$router.push('/login');
            },3000);

            break;
        }
      },
      //发送验证码
      verifySmsFun:function (data) {
        var thisRes = this;
        var resCode = data.result.resultCode;
        //防止提示消息重复出现
        $('.el-message').hide();
        switch (resCode){
          case msgResCode.USER_EXISTED:
            thisRes.$message({
              message:"该用户已注册，请直接登录",
              type: 'warning',
              duration:3000
            });
            thisRes.sendCode = true;
            break;
          case responseCode.SUCCESS_FULLY:
            thisRes.$message({
              message:"发送成功",
              type: 'success',
              duration:2000
            });
            break;
          case msgResCode.FREQUENT_VERIFICATION:
            thisRes.$message({
              message:'您的验证过于频繁，请稍后再试',
              type: 'warning',
              duration:3000
            });
            break;
        }
      }
    },
    mounted:function(){
      const thisObj = this;
      //ws链接建立
      thisObj.$root.eventHub.$on('wsOpen',this.paramFun);
      //监听返回数据
      //注册
      thisObj.$root.eventHub.$on('regResData', this.responseData);
      //发送验证码
      thisObj.$root.eventHub.$on('verifySms', this.verifySmsFun);
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  /*@import "../../../static/verify/css/verify_sty";*/
  @import "../../common/style/index";
  @import "../../common/style/login/login";
  .inp-code{
    .el-input{
      width:50%;
    }
    .fs12{
      margin-left: 14px;
    }
    .get-code{
      color:#409EFF;
      cursor: pointer;
    }
    .resend-code{
      color:#409EFF;
      span{
        color:#fff;
      }
    }
    .code-prompt{
      float: left;
      width: 100%;
      height: 16px;
      margin: -9px 0 0;
      color: #f56c6c;
    }
    .code-prompt{
      display: none;
    }
  }
  .el-form-item{
    margin: 16px 0;
  }
  /*.reg-box{*/
    /*right: -2000px;*/
  /*}*/
</style>
