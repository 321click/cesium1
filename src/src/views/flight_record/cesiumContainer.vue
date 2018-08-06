<template>
    <div id="box">
        <div id="cesiumContainer"></div>
        <div id="detailBox" class="detailBox" v-show="detailShow">
            <div class="detailInfo">
                <div class="detailInfoTitle">垂直速度</div>
                <div class="detailInfoData" id="speedH"></div>
            </div>
            <div class="detailInfo">
                <div class="detailInfoTitle">水平速度</div>
                <div class="detailInfoData" id="speedV"></div>
            </div>
            <div class="detailInfo">
                <div class="detailInfoTitle">距离</div>
                <div class="detailInfoData" id="distance" ></div>
            </div>
            <div class="detailInfo">
                <div class="detailInfoTitle">高度</div>
                <div class="detailInfoData" id="height"></div>
            </div>
            <div class="detailInfo">
              <div class="detailInfoTitle">电压</div>
              <div class="detailInfoData" id="voltage"></div>
            </div>
            <div class="detailInfo">
                <div class="detailInfoTitle">卫星</div>
                <div class="detailInfoData" id="satelite"></div>
            </div>
            <div class="detailInfo">
                <div class="detailInfoTitle">惯导状态</div>
                <div class="detailInfoData" id="location"></div>
            </div>
            <div class="detailInfo">
                <div class="detailInfoTitle">Home状态</div>
                <div class="detailInfoData" id="home"></div>
            </div>
            <div class="detailInfo">
                <div class="detailInfoTitle">连接状态</div>
                <div class="detailInfoData" id="connect"></div>
            </div>
            <div class="detailInfo">
                <div class="detailInfoTitle">经度</div>
                <div class="detailInfoData" id="lon"></div>
            </div>
            <div class="detailInfo">
                <div class="detailInfoTitle">纬度</div>
                <div class="detailInfoData" id="lat"></div>
            </div>
            <div class="detailInfo" >
                <!--左边飞机设备编号-->
                <div id="model"></div>
                <!--右边图标点击下拉按钮-->
                <div id="modelIcon" v-on:click="directToggle()">
                    <i class="el-icon-edit"></i>
                    <div id="directiveArea" v-show="directShow">
                      <div class="triangleBox">
                        <div class="upTriangle"></div><!--画一个上三角箭头-->
                      </div><!--triangleBox-->
                      <!--下面是各个命令控制-->
                      <div class="directBox">
                        <div id="directive1" class="directive"></div>
                        <div id="directive2" class="directive"></div>
                      </div>
                    </div>
                </div><!--modelIcon-->
            </div>
            <!--<el-table id="detailTable" :data = "tableData" style="width:100%;background-color:rgba(51,51,51,0.7);" >-->
                <!--<el-table-column align="center" prop="model" label="设备编号"></el-table-column>-->
                <!--<el-table-column align="center" prop="speedH" label="垂直速度"></el-table-column>-->
                <!--<el-table-column align="center" prop="speedV" label="水平速度"></el-table-column>-->
                <!--<el-table-column align="center" prop="distance" label="距离"></el-table-column>-->
                <!--<el-table-column align="center" prop="height" label="高度"></el-table-column>-->
                <!--<el-table-column align="center" prop="satelite" label="卫星"></el-table-column>-->
                <!--<el-table-column align="center" prop="voltage" label="电压"></el-table-column>-->
                <!--<el-table-column align="center" prop="location" label="惯导状态"></el-table-column>-->
                <!--<el-table-column align="center" prop="home" label="Home状态"></el-table-column>-->
                <!--<el-table-column align="center" prop="connect" label="连接状态"></el-table-column>-->
                <!--<el-table-column align="center" prop="lon" label="经度"></el-table-column>-->
                <!--<el-table-column align="center" prop="lat" label="纬度"></el-table-column>-->
            <!--</el-table>-->
        </div><!--detailBox-->
    </div>

</template>

<script>
  import Cesium from 'cesium/Cesium';
  import  widgets from'cesium/Widgets/widgets.css';
  import $ from "jquery";
  import enCesium from '../../common/js/common';

  //--------------------------------------全局属性定义-----------------------------------------------
  var profileId = "U0000"; //测试需要
  var trackedPlaneId; //当前操作的飞机Id
  var planeIdArray = new Array(); //存放飞机id的集合
  var pathJson = {}; //json对象，存放飞行路径
  var conditionJson = {}; //json对象，存放飞机信息
  var spasec = 1; //服务器更新点的时间(单位秒)
  var instances = new Array(); //存放几何图形（禁飞区）
  var ownedPlaneIds = new Array(); //存放当前用户对应的飞机id
  var pos = new Array(); //当前飞机的轨迹点集合
  var currentPath; //当前飞机的轨迹Entity
  var myPlayer; //播放器
  var pathEntities = new Array(); //存放绘制的路径entity
  var sampleJson = {}; //存放sampleProperty的Json
  var now; //保证时间的实时性，在查到后就赋值，临时赋值会受到卡顿的影响
  var angle = 0;
  var wayPointDeviceId; //绘制航点的设备Id
  var wayPointJson = {};


  export default {
    name: 'cesiumContainer',
    data(){
        // 还未返回一个对象
        return{
          // 详情显示区域显隐性
          detailShow:false,
          // 控制命令区域显隐性
          directShow:false,
        //     // tableData:[{
        //     //     model:'',
        //     //     speedH:'',
        //     //     speedV:'',
        //     //     distance:'',
        //     //     height:'',
        //     //     satelite:'',
        //     //     voltage:'',
        //     //     location:'',
        //     //     home:'',
        //     //     connect:'',
        //     //     lon:'',
        //     //     lat:''
        //     // }]
        }
    },
    created(){
      this.$root.eventHub.$on('deviceList', this.loadAllPlanesFromServer);
      this.$root.eventHub.$on('resDetail',this.analysizePlaneDetail);
    },
    mounted(){

      var vm = this;
      this.$root.eventHub.$on('wsOpen',this.loadAllplanes);
      // this.$root.eventHub.$on('wsOpen',this.loadPlaneDetailFromServer);
      // 使相机默认朝向中国
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(73, 4, 135, 53);
      Cesium.BingMapsApi.defaultKey = '';
      //--------------------------------------初始化地图-----------------------------------------------
      this.viewer = new Cesium.Viewer('cesiumContainer',{
        vrButton : false, //vr按钮
        animation : false, //是否显示动画控件
        baseLayerPicker : false, //是否显示图层选择控件
        geocoder : false, //是否显示地名查找控件
        timeline : false, //是否显示时间线控件
        sceneModePicker : false, //是否显示投影方式控件
        navigationHelpButton : false, //是否显示帮助信息控件
        infoBox : false, //是否显示点击要素之后显示的信息
        homeButton : false, //home按钮
        scene3DOnly : true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
        sceneMode : Cesium.SceneMode.SCENE3D, //初始场景模式
        fullscreenElement : document.body, //全屏时渲染的HTML元素
        shouldAnimate : true
      });
      var scene = this.viewer.scene;
      var camera = this.viewer.camera;
      var canvas = this.viewer.canvas;
      Cesium.Math.setRandomNumberSeed(3);
      var imageryLayers = this.viewer.imageryLayers;
      this.viewer.scene.globe.enableLighting = true; //日光
      scene.terrainProvider = Cesium.createWorldTerrain();
      scene.globe.depthTestAgainstTerrain = true;
      scene.pickTranslucentDepth = true;
      var url = 'http://{s}.tianditu.com/cia_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=cia&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles';
      imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
        url : url,
        layer : 'img',
        style : 'default',
        format : 'tiles',
        tileMatrixSetID : 'w',
        credit : new Cesium.Credit('天地图全球影像服务'),
        subdomains : [ 't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7' ],
        maximumLevel : 18
      }), 1);
      this.viewer._cesiumWidget._creditContainer.style.display = "none"; //隐藏下方版权信息
      // var options = {};
      // options.defaultResetView = Cesium.Rectangle.fromDegrees(71, 3, 90, 14);
      // options.enableCompass = false;
      // options.enableZoomControls = false;
      // options.enableDistanceLegend = true;
      // options.enableCompassOuterRing = false;
      // this.viewer.extend(Cesium.viewerCesiumNavigationMixin, options);
      // this.viewer.camera.setView({
      //   destination : Cesium.Cartesian3.fromDegrees(102, 33, 9000 * 1000),
      //   orientation : {
      //     heading : Cesium.Math.toRadians(0),
      //     pitch : Cesium.Math.toRadians(-90),
      //     roll : Cesium.Math.toRadians(0)
      //   }
      // });
      // this.viewer._cesiumWidget._creditContainer.style.display = "none"; //隐藏下方版权信息

      //--------------------------------------动作监听-----------------------------------------------

      this.viewer.screenSpaceEventHandler.setInputAction(leftClickAction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.viewer.screenSpaceEventHandler.setInputAction(leftDoubleClickAction, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      this.viewer.trackedEntityChanged.addEventListener(function(obj){
         //开始绘制路径
          if (trackedPlaneId != obj._id) {
            trackedPlaneId = obj._id;
            removePath();
            vm.viewer.entities.getById(trackedPlaneId).path.show._value = true;//轨迹显示的线设为true

            //将之前的点也绘制出来
            let p = sampleJson[obj._id]
            if (enCesium.commObj.defined(p)) {
              let times = p._property._times;
              for (var i in times) {
                // console.log("将之前的点绘制出来");
                let t = p.getValue(times[i]);
                if (enCesium.commObj.defined(t))
                  vm.drawPoint(t);
              }
            }
          }
      });

      //飞机双击函数
      function leftDoubleClickAction(e) {
        var entity = pickEntity(vm.viewer, e);
        // console.log(ownedPlaneIds);
        if (enCesium.commObj.defined(entity) && enCesium.commObj.contains(ownedPlaneIds, entity.id)) {
          //Only track the entity if it has a valid position at the current time.
          if (getValueOrUndefined(entity.position, vm.viewer.clock.currentTime)) {
            //console.log("这里1");
            vm.viewer.trackedEntity = entity;
            //将当前跟随的飞机设置为跟踪显示的飞机
          } else {
            //console.log("这里2");
            vm.viewer.trackedEntity = undefined;
            vm.viewer.zoomTo(entity);
          }
        }
      }
      // 飞机单击函数
      function leftClickAction(e) {

        //执行创造头部信息栏
        // vm.createDetailPanel();
        // console.log("飞机已单击一次");
        //只显示飞机的infobox
        var entity = pickEntity(vm.viewer, e);//选取实体
        if (enCesium.commObj.defined(entity) && entity._name.indexOf("飞机") != -1) {
          vm.viewer.selectedEntity = pickEntity(vm.viewer, e);
        } else if (!enCesium.commObj.defined(wayPointDeviceId)) {
          vm.viewer.selectedEntity = null;
        }
        if (!enCesium.commObj.defined(entity) && enCesium.commObj.defined(wayPointDeviceId)) {
          var ellipsoid = scene.globe.ellipsoid;
          var cartesian = vm.viewer.scene.pickPosition(e.position);
          //var cartesian = viewer.camera.pickEllipsoid(e.position, ellipsoid);
          if (Cesium.defined(cartesian)) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height; //模型高度
            var relativeHeight = 20; //相对高度
            // addWayPoint(wayPointDeviceId, [ lng, lat, height ], relativeHeight);
          }
        }
      }
      //根据点击的获取entity
      function pickEntity(viewer, e) {
        var picked = viewer.scene.pick(e.position);
        if (enCesium.commObj.defined(picked)) {
          var id = defaultValue(picked.id, picked.primitive.id);
          if (id instanceof Cesium.Entity) {
            return id;
          }
        }
      }
      function defaultValue(a, b) {
        if (a !== undefined && a !== null) {
          return a;
        }
        return b;
      }
      function getValueOrUndefined(property, time, result) {
        return enCesium.commObj.defined(property) ? property.getValue(time, result) : undefined;
      }
      //移除路径
      function removePath() {
        for (var i in pathEntities) {
          vm.viewer.entities.remove(pathEntities[i]);
        }
        pathEntities.splice(0, pathEntities.length);
        for (var i in ownedPlaneIds) {
          //复位
          vm.viewer.entities.getById(ownedPlaneIds[i]).path.show._value = false;
        }
      }

    },
    methods:{

      //加载所有飞机基本信息进来
      loadAllplanes(){
          var lthis = this;
          const allplanes = {
            messageType : messageType.QUERY_DEVICE_LIST,
            data:{
              deviceType:1,
              deviceId:'1234567890',
              profileId:'U2'
            }
          };
          // 定时查询
          var count = 0;
          setInterval(function(){
            // lthis.$root.eventHub.$emit('params', allplanes); // 传输点击的目标元素
            lthis.updatePosition("plane" + 1024, [ 110.0744619 + count++ / 10000, 33 + Math.random() * (Math.random > 0.5 ? 1 : -1) / 1000, 2000.0 ], "SYY911", true, 90);
            lthis.updatePosition("plane" + 1025, [ 120.0744619 + count++ / 10000, 33 + Math.random() * (Math.random > 0.5 ? 1 : -1) / 1000, 2000.0 ], "SYY911", true, 90);
            lthis.updateCondition("plane" + 1024, [ count, count, count, count, count, count, count, count, count, count, count ]);
            now = Cesium.JulianDate.now(); //获取到点的时候就是当前的时间
          },1000);
      },
      // 获取飞机所有信息
      loadAllPlanesFromServer(data){
          if (enCesium.commObj.defined(data.result) && data.result.resultDescription == "SUCCESS") {
            let list = data.deviceBaseShowInfoList;
            if (enCesium.commObj.defined(list) && list.length > 0) {
              now = Cesium.JulianDate.now(); //获取到点的时候就是当前的时间
              this.display_plane(list)
            }
          }else{

          }
      },
      // 获取飞机详情信息
      loadPlaneDetailFromServer() {
          const planesDetail = {
              messageType:messageType.QUERY_DEVICE_DETAIL,
              data:{
                deviceType : 1,
                deviceId : '1234567890',
                profileId : 'U2'
              }
          };
          this.$root.eventHub.$emit('params',planesDetail);// 传输点击的目标元素
          // this.analysizePlaneDetail(data);
      },
      analysizePlaneDetail(checkData){
          console.log(checkData);
          if (checkData.result.resultCode == "000000") {
            let detail = checkData.deviceDetailInfo;
            //			console.log(detail);
            if (enCesium.commObj.defined(detail))
              this.display_detail_info(detail);
          } else {
            //showNotification('bottom', 'right', "飞机详情加载失败，正在重试");
            // this.loadPlaneDetailFromServer(checkData);
          }
      },

      // 解析飞机基本信息，显示飞机baseInfo
      display_plane(data){
          // console.log(data);
          for(var p in data){
            let deviceBaseInfo = data[p].deviceBaseInfo;
            let device;
            let deviceLocation;
            let deviceName;
            let deviceStatus;
            let x;
            let y;
            let z;
            let newId;
            let authority;
            let deviceType;
            let model;
            let heading;
            if (enCesium.commObj.defined(deviceBaseInfo)) {
              device = deviceBaseInfo.device;
              if (enCesium.commObj.defined(device)) {
                newId = device.deviceId;
                deviceType = device.deviceType;
                model = device.deviceModel;
              }
              deviceLocation = deviceBaseInfo.deviceLocation;
              if (deviceLocation) {
                x = deviceLocation.longitude;
                y = deviceLocation.latitude;
                z = deviceLocation.height;
              }
              heading = deviceBaseInfo.headingAngle;
              deviceName = deviceBaseInfo.deviceName;
              deviceStatus = deviceBaseInfo.deviceStatus;
            }
            authority = data[p].enable;
            if ("0" == deviceStatus) {
              //根据条件判断是否是自己的飞机,自己的飞机则加载detail
              if (authority) {
                //如果不包含在已拥有
                if (!enCesium.commObj.contains(ownedPlaneIds, newId)) {
                  this.removePlaneFromArray(newId, planeIdArray);
                  //当前是sample飞机，所以坐标Callback可以移除了
                  if (enCesium.commObj.defined(pathJson[newId]))
                    delete pathJson[newId];
                }
                let data = {
                  "deviceType" : deviceType,
                  "deviceId" : newId,
                  "profileId" : 'U2'
                };
                console.log(123);
                //拥有的飞机可以加载详情
                // this.analysizePlaneDetail(data);
                // console.log(123);
                // this.loadPlaneDetailFromServer(data);
              } else if (enCesium.commObj.contains(ownedPlaneIds, newId)) //拥有的飞机发生改变
              {
                this.removePlaneFromArray(newId, ownedPlaneIds);
                // removePlaneFromArray(newId, ownedPlaneIds);
                if (enCesium.commObj.defined(sampleJson[newId]))
                  delete sampleJson[newId];
                //详情也不再显示
                if (enCesium.commObj.defined(conditionJson[newId]))
                  delete conditionJson[newId];
              }
              let path = pathJson[newId];

              if ((enCesium.commObj.defined(path) && path[path.length - 1].toString() == [ x, y, z ].toString()) || !enCesium.commObj.defined(newId) || !enCesium.commObj.defined(x) || !enCesium.commObj.defined(y) || !enCesium.commObj.defined(z)) //如果坐标重复则返回不操作
              {
                continue;
              }

              this.updatePosition(newId, [ x, y, z ], model, authority, heading);
            } else {
              if (enCesium.commObj.contains(planeIdArray, newId))
                this.removePlaneFromArray(newId, planeIdArray);
                // removePlaneFromArray(newId, planeIdArray);
              if (enCesium.commObj.contains(ownedPlaneIds, newId))
                this.removePlaneFromArray(newId, ownedPlaneIds);
                // removePlaneFromArray(newId, ownedPlaneIds);
              if (enCesium.commObj.defined(pathJson[newId]))
                delete pathJson[newId];
              if (enCesium.commObj.defined(sampleJson[newId]))
                delete sampleJson[newId];
              if (enCesium.commObj.defined(conditionJson[newId]))
                delete conditionJson[newId];
            }
          }

      },
      // 解析飞机详情信息
      display_detail_info(data) {
        let base = data.deviceBaseInfo;
        let tele = data.uavTelemetryInfo;
        let device;
        let uavInfo;
        let homeInfo;
        let batteryInfo;
        let deviceId;
        let speedH;
        let speedV;
        let planeX;
        let planeY;
        let planeZ;
        let homeX;
        let homeY;
        let homeZ;
        let satellite;
        let voltage;
        let locationStatus = "不可用";
        let homeStatus = "无效";
        let connectStatus = "未连接";
        let distance;
        let heading;
        let pitch;
        let roll;
        if (enCesium.commObj.defined(base)) {
          device = base.device;
          if (enCesium.commObj.defined(device)) {
            deviceId = device.deviceId;
          }
        }
        if (enCesium.commObj.defined(tele)) {
          uavInfo = tele.uavInfo;
          homeInfo = tele.homeInfo;
          batteryInfo = tele.batteryInfo;
          if (enCesium.commObj.defined(uavInfo)) {
            speedH = uavInfo.uavHVel;
            speedV = uavInfo.uavVVel;
            connectStatus = uavInfo.connectStatus;
            let uavLocation = uavInfo.uavLocation;
            if (enCesium.commObj.defined(uavLocation)) {
              planeX = uavLocation.longitude;
              planeY = uavLocation.latitude;
              planeZ = uavLocation.height;
            }
            let gps = uavInfo.gps;
            if (enCesium.commObj.defined(gps)) {
              satellite = gps.droneGpsNumber;
              locationStatus = gps.droneGpsStatus;
            }
            let attitude = uavInfo.attitude;
            if (enCesium.commObj.defined(attitude)) {
              heading = attitude.headingAngle;
              pitch = attitude.pitchAngle;
              roll = attitude.rollAngle;
            }
          }
          if (enCesium.commObj.defined(homeInfo)) {
            let homeLocation = homeInfo.homeLocation;
            if (enCesium.commObj.defined(homeLocation)) {
              homeX = homeLocation.longitude;
              homeY = homeLocation.latitude;
              homeZ = homeLocation.height;
            }
            homeStatus = homeInfo.homeValid;
          }
          if (enCesium.commObj.defined(batteryInfo)) {
            voltage = batteryInfo.voltage;
          }
        }
        if (enCesium.commObj.defined(homeStatus) && homeStatus == 1) {
          homeStatus = "有效";
        } else {
          homeStatus = "无效";
        }
        switch (locationStatus) {
          case 0:
            locationStatus = "不可用";
            break;
          case 1:
            locationStatus = "初始化中";
            break;
          case 2:
            locationStatus = "可用";
            break;
        }
        switch (connectStatus) {
          case 0:
            connectStatus = "未连接";
            break;
          case 1:
            connectStatus = "较差";
            break;
          case 2:
            connectStatus = "一般";
            break;
          case 3:
            connectStatus = "良好";
            break;
          case 4:
            connectStatus = "极好";
            break;
        }
        if (!enCesium.commObj.defined(planeX) || !enCesium.commObj.defined(planeY) || !enCesium.commObj.defined(planeZ)) {
          distance = "飞机定位异常";
        } else if (!enCesium.commObj.defined(homeX) || !enCesium.commObj.defined(homeY) || !enCesium.commObj.defined(homeZ)) {
          distance = "Home点定位异常";
        } else {
          var p1 = Cesium.Cartesian3.fromDegrees(planeX, planeY, planeZ);
          var p2 = Cesium.Cartesian3.fromDegrees(homeX, homeY, homeZ);
          distance = Cesium.Cartesian3.distance(p1, p2);
        }
        let conditionArray = [ parseFloat(speedH).toFixed(2), parseFloat(speedV).toFixed(2), (typeof distance == 'string') ? distance : parseFloat(distance).toFixed(2),
          parseFloat(planeZ - homeZ).toFixed(2), satellite, parseFloat(voltage).toFixed(2), locationStatus,
          homeStatus, connectStatus, parseFloat(planeX).toFixed(6), parseFloat(planeY).toFixed(6) ];
        this.updateCondition(deviceId, conditionArray);
      },
      // 更新飞机的位置
      updatePosition(deviceId, position, model, enable, heading){
        var vm = this;
        // console.log("更新位置(只有在有位置数据的时候才会更新数据)");
        if (enable) {
          if (sampleJson.hasOwnProperty(deviceId)) {
            // let a = Cesium.JulianDate.addSeconds(now, 1, new Cesium.JulianDate());
            // let b = Cesium.JulianDate.addSeconds(now, -1, new Cesium.JulianDate());
            // let c = Cesium.JulianDate.addSeconds(now, -2, new Cesium.JulianDate());
            // let d = Cesium.JulianDate.addSeconds(now, -3, new Cesium.JulianDate());
            // let e = Cesium.JulianDate.addSeconds(now, -6, new Cesium.JulianDate());
            sampleJson[deviceId].addSample(now, Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]));
          } else {
            let p = new Cesium.SampledPositionProperty(); //路径
            p.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD; //扩展方式:EXTRAPOLATE、HOLD
            p.forwardExtrapolationDuration = 1;
            p.backwardExtrapolationDuration = 1;
            p.setInterpolationOptions({
              interpolationDegree : 1,
              interpolationAlgorithm : Cesium.LinearApproximation
            });
            sampleJson[deviceId] = p;
            this.createSamplePlane(deviceId, "飞机 · " + model, p);
            // createSamplePlane(deviceId, "飞机 · " + model, p);
          }
          //画点
          if (enCesium.commObj.defined(trackedPlaneId) && trackedPlaneId == deviceId) {
            let center = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]); //当前点
            let lastTime = sampleJson[deviceId]._property._times;
            let last = sampleJson[deviceId].getValue(lastTime[lastTime.length - 2]);
            this.drawPoint(last);
            // drawPoint(last);
            if (enCesium.commObj.defined(heading)) {
              let plane = vm.viewer.entities.getById(deviceId);
              let orientation = Cesium.Transforms.headingPitchRollQuaternion(center, new Cesium.HeadingPitchRoll((heading - 90) * Math.PI / 180, 0, 0));
              plane.orientation = orientation;
            }
          }

        } else {
          if (pathJson.hasOwnProperty(deviceId)) {
            //清理旧的数据，只留一个以提高性能
            pathJson[deviceId].splice(0, pathJson[deviceId].length - 1);
            pathJson[deviceId].push(position);
          } else {
            pathJson[deviceId] = new Array(position);
            //新的飞机需要添加到页面
            this.createCallbackPlane(deviceId, "飞机 · " + model, position);
            // createCallbackPlane(deviceId, "飞机 · " + model, position);
          }
        }
      },
      // 更新飞机的信息
      updateCondition(deviceId, conditionArray) {
        var vm = this;
        if (conditionJson.hasOwnProperty(deviceId)) {
          //清理旧的数据，只留一个以提高性能
          conditionJson[deviceId].splice(0, conditionJson[deviceId].length - 1);
          conditionJson[deviceId].push(conditionArray);
        } else {
          conditionJson[deviceId] = new Array(conditionArray);
        }
        //
        if(vm.viewer.selectedEntity)
        console.log( vm.viewer.selectedEntity._id);
        //更新当前显示的数据
        if (enCesium.commObj.defined(vm.viewer.selectedEntity) && deviceId == vm.viewer.selectedEntity._id && enCesium.commObj.defined(profileId)) {
          vm.detailShow = true;
          $('#model').text(vm.viewer.selectedEntity._name);
          $('#speedH').text(conditionArray[0] + ' m/s');
          $('#speedV').text(conditionArray[1] + ' m/s');
          $('#distance').text(conditionArray[2] + ' m');
          $('#height').text(conditionArray[3] + ' m');
          $('#satelite').text(conditionArray[4]);
          $('#voltage').text(conditionArray[5] + ' V');
          $('#location').text(conditionArray[6]);
          $('#home').text(conditionArray[7]);
          $('#connect').text(conditionArray[8]);
          $('#lon').text(conditionArray[9]);
          $('#lat').text(conditionArray[10]);
          // this.tableData[0].model = vm.viewer.selectedEntity._name;
          // this.tableData[0].speedH = conditionArray[0];
          // this.tableData[0].speedV = conditionArray[1];
          // this.tableData[0].distance = conditionArray[2];
          // this.tableData[0].height = conditionArray[3];
          // this.tableData[0].satelite = conditionArray[4];
          // this.tableData[0].voltage = conditionArray[5];
          // this.tableData[0].location = conditionArray[6];
          // this.tableData[0].home= conditionArray[7];
          // this.tableData[0].connect = conditionArray[8];
          // this.tableData[0].lon = conditionArray[9];
          // this.tableData[0].lat = conditionArray[10];
        }
      },
      // 飞机操作指令点击显示隐藏
      directToggle(){
        this.directShow = !this.directShow;
      },
      createSamplePlane(deviceId, deviceName, position) {
        var vm = this;
        ownedPlaneIds.push(deviceId);
        var entity = vm.viewer.entities.add({
          id : deviceId,
          name : deviceName,
          //orientation : new Cesium.VelocityOrientationProperty(position),
          position : position,
          model : {
            uri : '../../../static/model/Cesium_Air.glb',
            minimumPixelSize : 64,
            silhouetteColor : Cesium.Color.YELLOW,
            silhouetteSize : 1.0,
            distanceDisplayCondition : new Cesium.DistanceDisplayCondition(0.0, 500)
          },
          billboard : {
            image : '../../../static/model/plane_1.png',
            distanceDisplayCondition : new Cesium.DistanceDisplayCondition(500),
            scaleByDistance : new Cesium.NearFarScalar(1.5e2, 0.2, 1.5e7, 0.01)
          },
          path : {
            show : false,
            leadTime : 0,
            trailTime : 60 * 60 * 24,
            width : 1,
            resolution : 1,
            material : new Cesium.PolylineGlowMaterialProperty({
              glowPower : 0.3,
              color : Cesium.Color.PALEGOLDENROD
            })
          }
        });
      },
      createCallbackPlane(deviceId, deviceName, defaultLoc){
        var vm = this;
        planeIdArray.push(deviceId);
        vm.viewer.entities.add({
          id : deviceId,
          name : deviceName,
          position : new Cesium.CallbackProperty(function(time, result) {
            let p = vm.getCurrentPosition(deviceId);
            if (p) {
              return Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2], Cesium.Ellipsoid.WGS84, result);
            } else if (result) {
              return result;
            } else {
              return Cesium.Cartesian3.fromDegrees(defaultLoc[0], defaultLoc[1], defaultLoc[2], Cesium.Ellipsoid.WGS84, result);
            }
          }, false),
          model : {
            uri : '../../../static/model/Cesium_Air.glb',
            minimumPixelSize : 64,
            distanceDisplayCondition : new Cesium.DistanceDisplayCondition(0.0, 500)
          },
          billboard : {
            image : '../../../static/model/plane_1.png',
            distanceDisplayCondition : new Cesium.DistanceDisplayCondition(500),
            scaleByDistance : new Cesium.NearFarScalar(1.5e2, 0.2, 1.5e7, 0.01)
          },
        });
      },

      removePlaneFromArray(id, array) {
        var vm = this;
        var index = $.inArray(id, array);
        if (index >= 0) {
          array.splice(index, 1);
        }
        vm.viewer.entities.removeById(id);
      },
      drawPoint(position) {
        var vm = this;
        var point = vm.viewer.entities.add({
          name : 'path',
          position : position,
          point : {
            show : true, // default
            color : Cesium.Color.SKYBLUE, // default: WHITE
            pixelSize : 2, // default: 1
            outlineColor : Cesium.Color.YELLOW, // default: BLACK
            outlineWidth : 1, // default: 0
            scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0.1)
          }
        });
        pathEntities.push(point);
      },

      getCurrentPosition(deviceId) {
        //返回最新的位置来绘制
        let p = pathJson[deviceId];
        if (!p)
          return;
        return p[p.length - 1];
      },
    },

  }
</script>

<style scoped>
  #box{
    position:relative;
  }
  #cesiumContainer{
      width:100%;
      height:86vh;
      overflow:hidden;
    position:relative;
  }
  #detailBox{
    position:absolute;left:0;top:0;
    text-align: center;
    width:100%;
    /*height:6vh;*/
    background-color: rgba(51,51,51,0.7);
    display:flex;
  }
  #model{
    line-height:6vh;
  }
  #detailTable{
    text-align: center;
  }
  .detailInfo{
    flex:1;
    border-right:1px solid #cccccc;
    color:#ccc;
    font-size:14px;
    border-bottom:2px solid #909399;
    /*文字不被选中*/

    -webkit-touch-callout: none; /* iOS Safari */

    -webkit-user-select: none; /* Chrome/Safari/Opera */

    -khtml-user-select: none; /* Konqueror */

    -moz-user-select: none; /* Firefox */

    -ms-user-select: none; /* Internet Explorer/Edge */

    user-select: none; /* Non-prefixed version, currently not supported by any browser */

  }
  .detailInfo:nth-child(1),.detailInfo:nth-child(2),.detailInfo:nth-child(3),.detailInfo:nth-child(4){
    width:10%;flex:none;
  }
  .detailInfo:nth-child(5){
    width:8%;flex:none;
  }
  #speedH,#speedV,#distance,#height,#voltage{
    font-size:18px;color:#6996fb;
  }
  .detailInfo:last-child{
    border-right:0;
    width:10%;flex:none;
  }
  .detailInfo:last-child div{
    float:left;
  }
  #model{
    width:calc(100% - 6vh);
    height: 6vh;
  }
  #modelIcon{
    width:6vh;
    height:6vh;
    font-size:28px;
    text-align: center;
    cursor:pointer;
    line-height:6vh;
    background-color:rgb(105,150,251);
    position:relative;
  }
  #directiveArea{
    position:absolute;
    left:0;
    top:calc(6vh + 5px);
  }
  .triangleBox{
      height:10px;width:6vh;
  }
  .upTriangle{
    width:0;height:0;
    border-width: 0px 10px 10px 10px;
    border-style: solid;
    border-color: rgb(52,121,152) transparent;
    margin:0 auto;
    position:absolute;left:0;right:0;
  }
  .directBox{

    /*position:absolute;*/
    /*left:0;*/
    /*top:10px;*/
  }
  .directive{
    width:6vh;
    height:6vh;
  }
  #directive1{
    background-color:rgb(52,121,152);
  }
  #directive2{
    background-color:rgb(35,103,133);
  }
  .detailInfoTitle{
      height:2.5vh;
      text-align:center;
      line-height:2.5vh;
  }
  .detailInfoData{
      height:3.5vh;
      text-align:center;
      line-height:3.5vh;
  }
</style>
