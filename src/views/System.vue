<template>
  <!-- 面板屑 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/example' }">系统</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 查询框 -->
  <el-row :gutter="10">
    <el-col :span="10">
      <div><strong>Worker</strong></div>
      <el-table :data="workerData" style="width: 100%">
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="ip" label="IP"></el-table-column>
        <el-table-column prop="port" label="端口"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <div :class="'icon-' + (scope.row.status?'online':'offline')"></div>
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="操作">
          <template #default="scope">
            <el-button @click="handleDetail(scope.$index, scope.row)" icon="el-icon-s-data" circle></el-button>
            <el-popconfirm :title="'确定删除用例【'+scope.row.ip+'】吗？'" @confirm="handleDelete(scope.$index, scope.row)">
              <template #reference>
                <el-button icon="el-icon-delete" circle></el-button>
              </template>
            </el-popconfirm>
          </template>
      </el-table-column>
      </el-table>
      <el-button type="primary">添加Worker</el-button>
    </el-col>
    <el-col :span="8">
    </el-col>
  </el-row>
</template>
<script>
export default {
  data () {
    return {
      workerData: [{
        ip: '192.168.0.13',
        port: 8378,
        status: '在线'
      }]
    }
  },
  created () {
    this.getWorkerList()
  },
  methods: {
    async getWorkerList () {
      const { data: res } = await this.$axios.get('/system/worker/list')
      if (!res.success) return this.$message.error(res.errCode)
      this.workerData = res.data
    }
  }
}
</script>

<style scoped>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 14px;
}
.icon-online {
  border-radius: 50%;
  height: 14px;
  width: 14px;
  background-color: green;
}
.icon-offline {
  border-radius: 50%;
  height: 14px;
  width: 14px;
  background-color: red;
}
</style>
