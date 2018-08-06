//引用文件
import Login from '../views/login';
import registerCont from '../views/register/register';
import forgetPass from '../views/forget_pass/forget_pass';
import Index from '../views/index';
import Home from '../views/home';
import realTimeMon from '../views/flight_record/real_time_monitoring';
import historyRecord from '../views/flight_record/history_record';
import cesiumContainer from '../views/flight_record/cesiumContainer'
import deviceList from '../views/device_management/device_list';
import page1 from '../views/page1';


let routes = [
  {
    path:'/',
    component:Index,
    name:'',
    hidden: true,
  },
  {
    path:'/login',
    component:Login,
    name:'',
    hidden: true
  },
  {
    path:'/register',
    component:registerCont,
    name:'',
    hidden: true
  },
  {
    path:'/forget_pass',
    component:forgetPass,
    name:'',
    hidden: true
  },
  {
    path:'/home',
    component:Home,
    name:'飞行记录',
    iconCls:'el-icon-location-outline',
    children:[
      {path:'/real_time_monitoring',iconCls:'el-icon-edit-outline',component:realTimeMon,name:'实时监控'},
      {path:'/history_record',iconCls:'el-icon-time',component:historyRecord,name:'历史记录'},
      {path:'/cesiumContainer',iconCls:'el-icon-rank',component:cesiumContainer,name:'飞行演示',id:'cesiumBtn'}
    ],
    // redirect:'/real_time_monitoring' //默认展示实时监控
  },
  {
    path:'/home',
    component:Home,
    name:'设备管理',
    iconCls:'el-icon-location-outline',
    children:[
      {path:'/device_list',iconCls:'el-icon-tickets',component:deviceList,name:'设备列表',id:'deviceCli'},
    ],
  },
  {
    path: '/home',
    component: Home,
    name: '',
    iconCls:'el-icon-tickets',
    leaf: true,//只有一个节点
    children: [
      { path: '/page1', component: page1, name: 'page1' }
    ]
  },
];
export default routes;
