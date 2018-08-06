<template>
  <div>
    <!--工具条-->
    <!--<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">-->
    <!--<span class="fs16 top-tit">设备列表</span>-->
    <!--</el-col>-->
    <el-col :span="24" class="toolbar batch-dele">
      <!--disabled值动态显示，默认为true，当选中复选框后值为false-->
      <el-button type="info" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      <el-button class="add-device" type="primary" @click="handleAdd"><i class="el-icon-plus"></i>新增</el-button>
    </el-col>
    <!--列表-->
    <el-table :data="deviceList" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <!--<el-table-column :deviceType="deviceTypes"><span>{{deviceTypes}}</span></el-table-column>-->
      <el-table-column type="selection"></el-table-column>
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="device.deviceId" label="设备ID"></el-table-column>
      <el-table-column prop="deviceName" label="设备名称"></el-table-column>
      <el-table-column prop="device.deviceModel" label="设备型号"></el-table-column>
      <el-table-column prop="deviceStatus" label="状态" :formatter="formatState"></el-table-column>
      <el-table-column class="ope-btns" label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <div class="block">
      <!--
        size-change：pageSize 改变时会触发，回调参数（每页条数）
        current-change：currentPage 改变时会触发，回调参数（当前页）
        current-page:当前页数
        page-size: 每页显示条目个数
        pager-count:页码按钮的数量，当总页数超过该值时会折叠（[5,21]）
        layout:组件布局
        total:总数
      -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :pager-count="5"
        layout="prev, pager, next, jumper"
        :total="totalCount">
      </el-pagination>
    </div>

    <!--新增-->
    <el-dialog class="tab-show add-device" title="新增" :visible.sync="addFormVisible">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="设备ID" prop="deviceId">
          <el-input v-model="addForm.deviceId" placeholder="请输入设备ID" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="addForm.deviceName" placeholder="请输入设备名称" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备型号" prop="deviceModel">
          <el-input v-model="addForm.deviceModel" placeholder="请输入设备型号" auto-complete="off"></el-input>
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">确定</el-button>
      </div>
    </el-dialog>

    <!--编辑-->
    <el-dialog class="tab-show" title="编辑" :visible.sync="editFormVisible">
      <el-form :model="editForm" label-width="94px" :rules="editFormRules" ref="editForm">
        <el-form-item label="设备ID：" prop="deviceId">
          <el-input class="readonly-inp" v-model="editForm.deviceId" readonly :value="editForm.deviceId"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备型号：" prop="deviceModel">
          <el-input class="readonly-inp" v-model="editForm.deviceModel" readonly :value="editForm.deviceModel"
                    auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item label="设备名称：" prop="deviceName">
          <el-input v-model="editForm.deviceName" placeholder="请输入设备名称" auto-complete="off"></el-input>
        </el-form-item>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "device_list",
    data() {
      return {
        //分页
        currentPage: 1, //分页默认显示第一页
        pageSize: 20, //默认每页数据量
        totalCount:20, //默认数据总数
        listLoading: false,
        sels: [],//列表选中的值显示
        deviceList: [],
        addFormVisible: false, //新增是否显示
        addLoading: false,
        deviceTypes: '',
        addForm: {  //新增页面数据
          deviceId: '',
          deviceName: '',
          deviceModel: '',
        },
        addFormRules: {
          deviceId: [
            {
              required: true,
              message: '请输入设备ID',
              trigger: 'blur'
            }
          ],
          deviceName: [
            {
              required: true,
              message: '请输入设备名称',
              trigger: 'blur'
            }
          ]
        },
        // 编辑弹窗
        editFormVisible: false,
        editLoading: false,
        editForm: {
          deviceId: '',
          deviceName: '',
          deviceModel: ''
        },
        editFormRules: {}

      }
    },
    methods: {
      loadList() {
        const profileId = sessionStorage.getItem('profileId');
        const dataObj = {
          messageType: messageType.QUERY_DEVICE_LIST,
          data: {
            deviceType: '1',
            profileId: profileId
          }
        };
        //设置需要请求的数据的匹配信息并通过'params'与app通讯，主要依靠eventhub的转换
        this.$root.eventHub.$emit('params', dataObj); // 传输点击的目标元素
      },

      //离线还是在线
      formatState: function (row, column) {
        /* 0:在线 1:离线2:异常3:未知*/
        return row.deviceStatus == 0 ? '在线' : row.deviceStatus == 1 ? '离线' : row.deviceStatus == 2 ? '异常' : '未知';
      },
      //新增
      handleAdd: function () {
        this.addFormVisible = true;
        // this.$refs['addForm'].resetFields();
        this.addForm = {};
      },
      selsChange: function (sels) {
        this.sels = sels;
      },
      //单个删除
      handleDel: function (index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = {id: row.id};
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          // removeUser(para).then((res) => {
          //   this.listLoading = false;
          //   //NProgress.done();
          //   this.$message({
          //     message: '删除成功',
          //     type: 'success'
          //   });
          //   this.getUsers();
          // });
        }).catch(() => {

        });
      },
      //批量删除
      batchRemove: function () {
        var ids = this.sels.map(item => item.id).toString();
        this.$confirm('确认删除选中记录吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;

          let para = {ids: ids};
          // batchRemoveUser(para).then((res) => {
          //   this.listLoading = false;
          //   //NProgress.done();
          //   this.$message({
          //     message: '删除成功',
          //     type: 'success'
          //   });
          //   this.getUsers();
          // });
        }).catch(() => {

        });
      },
      //分页
      //每页显示数据量变更
      handleSizeChange(val) {
        this.pageSize = val;
        console.log(`每页 ${val} 条`);
      },
      //页码变更
      handleCurrentChange(val) {
        this.currentPage = val;
        console.log(`当前页: ${val}`);
      },
      //确定新增
      addSubmit: function () {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            this.addLoading = true;
            this.$refs['addForm'].resetFields();
            this.addFormVisible = false;
            let para = Object.assign({}, this.addForm); //向已有对象上添加一些属性
            this.$message({
              message: '新增成功',
              type: 'success'
            });
          }
        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        //处理数据,回显到页面上
        const dataShow = {
          'deviceName': row.deviceName,
          'deviceId': row.device.deviceId,
          'deviceModel': row.device.deviceModel,
          'deviceType': row.device.deviceType
        };
        this.editFormVisible = true;
        this.editForm = Object.assign({}, dataShow);
      },
      //确定编辑
      editSubmit: function () {
        this.editLoading = true;
        let para = Object.assign({}, this.editForm);
        const dataObj = {
          messageType: messageType.MODIFY_DEVICE_INFO,
          data: {
            deviceType: para.deviceType,
            deviceId: para.deviceId,
            deviceName: para.deviceName
          }
        };
        console.log(dataObj);
        this.$root.eventHub.$emit('params', dataObj);
      },
      //获取的设备列表
      responseData(data) {
        const thisObj = this;
        console.log('设备列表：');
        console.log(data);
        thisObj.deviceList = []; //清空页面数据
        if (data.result.resultCode == responseCode.SUCCESS_FULLY) {
          if (messageType.QUERY_DEVICE_LIST == data.messageType) {
            const dataLi = data.deviceBaseShowInfoList;
            for (var i = 0; i < dataLi.length; i++) {
              thisObj.deviceList.push(dataLi[i].deviceBaseInfo);
            }
          }
        }
      },
      //修改成功
      changeDeviceResponse(data){
        const thisObj = this;
        console.log(data);
        if(data.result.resultCode == responseCode.SUCCESS_FULLY){
          thisObj.editFormVisible = false;
          thisObj.editLoading = false;
          thisObj.deviceList=[]; //清空页面数据
          thisObj.loadList(); //重新获取数据
        }
      }
    },
    mounted() {
      var thisObj = this;
      //点击左侧发送请求
      $(document).on('click','#deviceCli',function () {
        thisObj.deviceList = []; //清空页面数据
        thisObj.loadList(); //重新获取数据
      });
      //建立链接
      thisObj.$root.eventHub.$on('wsOpen', this.loadList);
      //查询设备列表
      thisObj.$root.eventHub.$on('deviceList', this.responseData);
      //确定修改设备信息
      thisObj.$root.eventHub.$on('changeDeviceInfo', this.changeDeviceResponse);

    }

  }
</script>

<style lang="less" rel="stylesheet/less">
  @import "../../common/style/device_management/device_list";

  .el-form-item__content {
    line-height: 32px;
    margin-top: 10px;
  }

  .el-form--inline .el-form-item {
    margin-right: 0px;
  }

  .el-icon-plus {
    margin-right: 4px;
  }

  .el-table__header-wrapper {
    table {
      width: 100%;
    }
  }

  .el-table__header-wrapper {
    .el-table th {
      padding: 8px 0;
    }
  }

  .el-button--small {
    padding: 7px 11px;
  }

  .el-dialog {
    width: 34%;
    min-width: 400px;
  }

  .tab-show {
    .el-form-item__content {
      margin-top: 3px;
    }
    .el-form-item {
      margin-bottom: 0;
    }
    &.add-device {
      .el-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .el-checkbox__input.is-indeterminate .el-checkbox__inner::before {
    height: 4px;
    top: 6px;
  }

  .readonly-inp .el-input__inner {
    border: none !important;
  }


</style>
