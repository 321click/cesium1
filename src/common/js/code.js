/*
* k 2018/7/5
* */
//请求返回码
let responseCode = {
  SUCCESS_FULLY:'000000', //请求成功
  SERVER_ERROR:'888888', //请求失败
  INVALID_LOGIN_STATUS:'80000',//登录状态无效
  VALID_LOGIN_STATUS:'80001', //登录状态有效
  CONCURRENT_ACCOUNT:'80002', //重复登录
};

//请求码
let requestCode = {
  QUERY_NO_FLY:'70003', //查询禁飞区
  DEVICE_BIND:'70004', //设备绑定
  DEVICE_UNTIE:'70005', //设备解绑
  VIDEO_PLAY_PATH:'70006', //视频播放路径
  MODIFY_DEVICE_INFO:'70007', //修改设备信息
  DEVICE_BIND_SEND_MESSAGE:'70008', //绑定设备时发送的短信
  QUERY_ACCOUNT_INFO:'70009', //查询账户信息
  SEND_VERIFY_SMS:'70010', //发送验证短信
  CHECK_VERIFY:'70011', //校验验证短信
  QUERY_DEVICE_LIST:'70012', //查询设备列表
  QUERY_DEVICE_DETAIL:'70013', //查询设备详情
  EXIT_LOGON:'70014', //退出登录
  WEBSOCKET_HEARTBEAT:'70015', //Websocket心跳
  FLIGHT_CONTROL_OF_UAV:'70016', //无人机飞行控制（起飞:1、降落:2、返航:3、悬停:4、继续任务:5）
  UPLOAD_NAVIGATION_POINT:'70017', //上传航点
  DOWNLOAD_NAVIGATION_POINT:'70018', //下载航点
};

export default {
  responseCode(){
    return responseCode
  },
  requestCode(){
    return requestCode
  }
}
