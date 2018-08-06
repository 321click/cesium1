<template>
  <div id="app">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
  // import encDec from './common/js/common';
  var ws; //webSocket通信链路
  //是否需要再次跟后台建立链接
  let needReConnect = true;
  //心跳
  const heartCheck = {
    timeout: 60000, //60s
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function () {
      clearTimeout(this.timeoutObj);
      clearTimeout(this.serverTimeoutObj);
      this.start();
    },
    start: function () {
      let self = this;
      this.timeoutObj = setTimeout(function () {
        const json = {
          messageType: messageType.WEBSOCKET_HEARTBEAT,
          data: {}
        };
        ws.send(JSON.stringify(json));
        self.serverTimeoutObj = setTimeout(function () {
          heartCheck.stop();
        }, self.timeout);
      }, this.timeout)
    },
    stop: function () {
      console.log("服务器超时主动断开");
      needReConnect = false;
      ws.close(); //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
      clearTimeout(this.timeoutObj);
      clearTimeout(this.serverTimeoutObj);
    },
  };
  export default {
    name: 'app',
    data() {
      return {}
    },
    methods: {
      //初始化webSocket
      initWebpack() {
        var thisV = this;
        if ("WebSocket" in window) {
          // setTimeout(function() {
          const wsuri = "ws://192.168.1.35:8080/uavicc/websocket";
          ws = new WebSocket(wsuri);
          this.setListener();
          // }, 500);

        } else {
          //不支持提示
          thisV.$message({
            message: "您的浏览器版本过低，无法建立连接",
            type: 'warning',
            duration: 3500
          });
          // showInfoDialog(350, 200, "提示", "您的浏览器版本过低，无法建立连接");
        }
      },
      //websocket 监听函数
      setListener() {
        var thisV = this;
        // const respData = this.$options.methods.deData();
        ws.onopen = function () {
          console.log("onopen");
          heartCheck.start();
          thisV.$root.eventHub.$emit('wsOpen', true);
        };
        ws.onmessage = function (e) {
          var redata = JSON.parse(e.data);
          switch (redata.messageType) {
            //Websocket心跳
            case messageType.WEBSOCKET_HEARTBEAT:
              heartCheck.reset();
              break;
            //用户状态
            case messageType.USER_STATUS_NOTIFY:
              var redata = JSON.parse(e.data);
              switch (redata.result.resultCode) {
                //登录状态无效
                case responseCode.INVALID_LOGIN_STATUS:
                  thisV.$message({
                    message: redata.result.resultDescription,
                    type: 'warning',
                    duration: 3000
                  });
                  break;
              }
              break;
            //用户登录
            case messageType.USER_LOGIN:
              var redata = JSON.parse(e.data);
              thisV.$root.eventHub.$emit('loginResData', redata);
              break;
            //用户注册
            case messageType.USER_REGIST:
              var redata = JSON.parse(e.data);
              thisV.$root.eventHub.$emit('regResData', redata);
              break;
            //发送验证码
            case messageType.SEND_VERIFY_SMS:
              var redata = JSON.parse(e.data);
              thisV.$root.eventHub.$emit('verifySms', redata);
              break;
            //重置密码
            case messageType.USER_RESET_PASS:
              var redata = JSON.parse(e.data);
              thisV.$root.eventHub.$emit('resetPass', redata);
              break;
            //  退出登录
            case messageType.EXIT_LOGON:
              var redata = JSON.parse(e.data);
              thisV.$root.eventHub.$emit('exitLogin', redata);
              break;
            //查询设备列表
            case messageType.QUERY_DEVICE_LIST:
              var responseData = JSON.parse(e.data);
              thisV.$root.eventHub.$emit('deviceList', responseData);
              break;

            //查询设备详情
            case messageType.QUERY_DEVICE_DETAIL:
              const resDetail = JSON.parse(e.data);
              thisV.$root.eventHub.$emit('resDetail', resDetail);
              break;
            //修改设备信息
            case messageType.MODIFY_DEVICE_INFO:
              var redata = JSON.parse(e.data);
              thisV.$root.eventHub.$emit('changeDeviceInfo', redata);
              break;
            //设备解绑
            case messageType.DEVICE_UNTIE:
              var redata = JSON.parse(e.data);
              thisV.$root.eventHub.$emit('deviceUntie', redata);
              break;
          }
        };
        ws.onclose = function () {
          console.log("WebSocket关闭");
        };
        ws.error = function () {
          console.log("WebSocket连接失败");
          heartCheck.stop();
          thisV.$message({
            message: "抱歉，连接发生中断",
            type: 'warning',
            duration: 3500
          });
        }
      },
      //发送请求
      requestData(data) {
        var thisRes = this;
        //获取用户id，用于判断用户是否登录
        var profileId = sessionStorage.getItem('profileId');
        if(ws.readyState == 1){
          //判断用户是否登录
          if(profileId){
            const param = JSON.stringify(data);
            ws.send(param);
          }else{
            thisRes.$message({
              message: "抱歉，请您先登录",
              type: 'warning',
              duration: 2000
            });
          }
        }
      },
      //登录、注册、找回密码等不需要校验用户是否登录
      requestNoCheckData(data){
        const param = JSON.stringify(data);
        ws.send(param);
      }

    },
    created() {
      this.initWebpack();
      //监听传过来的参数
      this.$root.eventHub.$on('params', this.requestData);
      //不需要校验用户是否登录
      this.$root.eventHub.$on('responseNoCheck', this.requestNoCheckData);
    }
  }
</script>

<style lang="less" scoped rel="stylesheet/less">
</style>
