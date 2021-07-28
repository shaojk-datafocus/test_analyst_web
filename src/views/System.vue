<template>
  <!-- 面板屑 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/example' }">系统</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 查询框 -->
  <el-row :gutter="10">
    <el-col :span="12">
      <div><strong>Worker</strong></div>
      <el-table :data="workerData" style="width: 100%">
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="ip" label="IP"></el-table-column>
        <el-table-column prop="port" label="端口" min-width="50"></el-table-column>
        <el-table-column prop="branch" label="分支" min-width="200">
          <template #default="scope">
            <ul>
                <li v-for="(value, key, index) in scope.row.branch" :key="index"> {{key}} - {{value}}</li>
            </ul>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="50">
          <template #default="scope">
            <div :class="'icon-' + (scope.row.status?'online':'offline')"></div>
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="操作" min-width="150">
          <template #default="scope">
            <el-button @click="handleDetail(scope.$index, scope.row)" icon="el-icon-s-data" circle></el-button>
            <el-button @click="connectWorker(scope.$index, scope.row)" icon="el-icon-connection" circle></el-button>
            <el-popconfirm :title="'确定删除用例【'+scope.row.ip+'】吗？'" @confirm="handleDelete(scope.$index, scope.row)">
              <template #reference>
                <el-button icon="el-icon-delete" circle></el-button>
              </template>
            </el-popconfirm>
          </template>
      </el-table-column>
      </el-table>
      <el-button type="primary" @click="dialogVisible=true;dialogTitle='新增Worker'">添加Worker</el-button>
    </el-col>
    <el-col :span="8">
      <el-date-picker
        v-model="deleteTime"
        type="datetime"
        placeholder="选择日期时间"
        :default-time="defaultTime" style="margin-right:10px">
      </el-date-picker>
      <el-button @click="cleanHistory">清除历史测试记录</el-button>
    </el-col>
  </el-row>
  <el-dialog
      :title="dialogTitle"
      ref="dialog"
      v-model="dialogVisible"
      width="50%"
      @closed="dialogClosed()"
      >
      <el-form ref="workerRef" :model="workerForm" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="workerForm.name"></el-input>
        </el-form-item>
        <el-form-item label="IP" prop="ip" >
          <el-input v-model="workerForm.ip"></el-input>
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="workerForm.port"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="workerForm.path"></el-input>
        </el-form-item>
        <el-form-item label="分支" prop="branch">
          <el-input v-model="workerForm.branch"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addWorker">确 定</el-button>
        </span>
      </template>
    </el-dialog>
</template>
<script>
import { ElMessage } from 'element-plus'

export default {
  data () {
    return {
      workerData: [],
      dialogVisible: false,
      dialogTitle: '新增Worker',
      deleteTime: '',
      workerForm: {
        port: 8378
      },
      rules: {
        ip: [
          { required: true, message: '请输入Worker IP地址', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '请输入Worker端口', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getWorkerList()
  },
  setup () {
    return {
      success (message) {
        ElMessage({
          showClose: true,
          message: message,
          type: 'success'
        })
      },
      error (message) {
        ElMessage({
          showClose: true,
          message: message,
          type: 'error'
        })
      }
    }
  },
  methods: {
    async getWorkerList () {
      const { data: res } = await this.$axios.get('/api/system/worker/list')
      if (!res.success) return this.$message.error(res.errCode)
      this.workerData = res.data
      this.workerData.forEach(item => {
        item.branch = JSON.parse(item.branch)
      })
      console.log(this.workerData)
    },
    async addWorker () {
      if (this.workerForm.id) { // 更新worker配置
        const { data: res } = await this.$axios.post('/api/system/worker/update', this.workerForm)
        if (!res.success) return this.$message.error(res.errCode)
        this.getWorkerList()
        this.dialogVisible = false
        this.success('更新Worker成功')
      } else { // 新增worker
        const { data: res } = await this.$axios.post('/api/system/worker/add', this.workerForm)
        if (!res.success) return this.$message.error(res.errCode)
        this.getWorkerList()
        this.dialogVisible = false
        this.success('新增Worker成功')
      }
    },
    handleDetail (index, row) {
      this.dialogVisible = true
      this.dialogTitle = '编辑Worker'
      this.workerForm = row
    },
    async handleDelete (index, row) {
      const { data: res } = await this.$axios.post('/api/system/worker/delete/' + row.id)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('删除Worker【' + row.testname + '】')
      this.getWorkerList()
    },
    async connectWorker (index, row) {
      const { data: res } = await this.$axios.post('/api/system/worker/connect', { ip: row.ip, port: row.port })
      if (!res.success) return this.error(res.exception)
      this.success('成功连接Worker<' + row.ip + ':' + row.port + '>')
      this.getWorkerList()
    },
    dialogClosed () {
      this.$refs.workerRef.resetFields() // 为什么resetFields无效?
      this.workerForm = { port: 8378 }
    },
    async cleanHistory () {
      console.log(this.deleteTime)
      const { data: res } = await this.$axios.post('/api/system/record/clean', { deleteTime: this.deleteTime })
      if (!res.success) return this.error(res.exception)
      this.success('成功删除历史记录')
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
