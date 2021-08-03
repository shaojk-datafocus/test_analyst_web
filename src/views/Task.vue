<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/task' }">任务</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 查询框 -->
    <el-row :gutter="10">
      <el-col :span="6">
        <el-input
          placeholder="按名称搜索"
          v-model="taskname"
          class="input-with-select"
          clearable
          size="mini"
          @change="getTaskList"
        >
        </el-input>
      </el-col>
      <el-col :span="12">
        <el-button type="warning" size="mini" :disabled="multipleSelection.length<=0" @click="tempTaskDialogVisible=true">执行任务</el-button>
        <el-popconfirm :title="'确定删除所有选中任务吗？'" @confirm="deleteTaskByBatch">
          <template #reference>
            <el-button type="danger" size="mini" :disabled="multipleSelection.length<=0">删除任务</el-button>
          </template>
        </el-popconfirm>
      </el-col>
    </el-row>
    <!-- 用例内容表格展示 -->
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      height="700"
      @selection-change="handleSelectionChange"
      @row-click="toggleSelection"
      @row-dblclick="toggleDblClick"
      size="mini"
    >
      <el-table-column type="selection" width="36"></el-table-column>
      <el-table-column prop="taskname" label="名称" width="300" sortable></el-table-column>
      <el-table-column prop="description" label="描述" width="300"></el-table-column>
      <el-table-column prop="creator" label="创建人" sortable></el-table-column>
      <el-table-column prop="worker_id" label="Worker" sortable v-slot="scope">
        <el-tag type="info">{{ optionsWorker[scope.row.worker_id] }}</el-tag>
      </el-table-column>
      <el-table-column prop="content" label="包含用例数量" sortable></el-table-column>
      <el-table-column prop="execute_time" label="最近执行时间" sortable></el-table-column>
      <el-table-column prop="elapse_time" label="耗时" sortable></el-table-column>
      <el-table-column prop="operate" label="操作" width="250">
        <template #default="scope">
          <el-button size="mini" @click="handleDetail(scope.$index, scope.row)" icon="el-icon-s-order" class="icon" circle></el-button>
          <el-popconfirm :title="'是否执行任务【'+scope.row.taskname+'】吗？'" @confirm="handleTrigger(scope.$index, scope.row)">
            <template #reference>
              <el-button size="mini" icon="el-icon-s-promotion" class="icon" circle></el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm :title="'确定删除任务【'+scope.row.taskname+'】吗？'" @confirm="handleDelete(scope.$index, scope.row)">
            <template #reference>
              <el-button size="mini" icon="el-icon-circle-close" class="icon" circle></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    <!-- 新增任务弹框 -->
    <el-dialog
      title="新增任务"
      v-model="dialogVisible"
      width="50%"
      @closed="dialogClosed()"
      >
      <el-form ref="addTaskRef" :model="addTaskForm" :rules="rules" label-width="80px">
        <el-form-item label="任务名称" prop="taskname" >
          <el-input v-model="addTaskForm.taskname" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="addTaskForm.description"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
            <el-transfer
              v-model="addTaskForm.content"
              filterable
              :titles="['全部', '已部署']"
              :filter-method="filterMethod"
              filter-placeholder="请输入用例名称"
              :data="testData"
              style="width:100%"
            />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addTask">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 执行临时任务弹框 -->
    <el-dialog
      title="是否确定任务？"
      v-model="tempTaskDialogVisible"
      width="50%"
      >
      <el-form ref="tempTaskRef" :model="tempTaskForm" :rules="rules" label-width="80px">
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="tempTaskForm.description"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="tempTaskDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="triggerTempTask">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { ElMessage } from 'element-plus'
export default {
  data () {
    return {
      taskname: '',
      page: 1,
      pageSize: 20,
      total: 0,
      multipleSelection: [],
      tableData: [],
      dialogVisible: false,
      tempTaskDialogVisible: false,
      addTaskForm: {
        taskname: '',
        module: '',
        function: '',
        description: ''
      },
      tempTaskForm: {
        description: ''
      },
      rules: {
        taskname: [
          { required: true, message: '请输入任务名称', trigger: 'blur' }
        ]
      },
      filterMethod (query, item) {
        return item.spell.indexOf(query) > -1
      },
      testData: [],
      optionsWorker: {}
    }
  },
  created () {
    this.getWorkerList()
    this.getTaskList()
    this.getExampleList()
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
    async getTaskList () {
      const { data: res } = await this.$axios.get('/api/task/list',
        { params: { taskname: this.taskname, pageSize: this.pageSize, page: this.page } })
      if (!res.success) return this.$message.error(res.errCode)
      this.tableData = res.data.datas
      console.log(this.tableData)
      this.tableData.forEach(item => {
        let et = item.elapse_time
        if (et) {
          item.elapse_time = parseInt(et % 60) + 's'
          et = parseInt(et / 60)
          if (et > 0) {
            item.elapse_time = et + 'min ' + item.elapse_time
          }
        } else {
          item.elapse_time = '无执行记录'
        }
        item.content = item.content.split(',').length
      })
      this.total = res.data.total
    },
    addTask () {
      this.$refs.addTaskRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$axios.post('/api/task/add', this.addTaskForm)
        if (!res.success) return this.$message.error(res.errCode)
        this.getTaskList()
        this.dialogVisible = false
      })
    },
    async triggerTempTask () {
      var content = []
      this.multipleSelection.forEach(item => {
        content.push(item.id)
      })
      console.log(content)
      const { data: res } = await this.$axios.post('/api/task/trigger', { taskname: null, description: this.tempTaskForm.description, creator: '阿斯蒂芬', content: content })
      if (!res.success) return this.$message.error(res.errCode)
      this.success('创建临时任务成功')
      this.$refs.multipleTable.clearSelection()
      this.tempTaskDialogVisible = false
    },
    dialogClosed () {
      this.$refs.addTaskRef.resetFields() // 为什么resetFields无效?
      this.addTaskForm = {}
    },
    handleDetail (index, row) {
      const routeData = this.$router.resolve({ path: '/task/' + row.id })
      window.open(routeData.href)
    },
    async handleSwitch (index, row) {
      const { data: res } = await this.$axios.post('/api/task/switch/' + row.id)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('开始执行任务【' + row.taskname + '】')
    },
    async handleTrigger (index, row) {
      const { data: res } = await this.$axios.post('/api/task/trigger/' + row.id)
      if (!res.success) return this.error('执行任务失败【' + row.taskname + '】')
      this.success('开始执行任务【' + row.taskname + '】')
    },
    async handleDelete (index, row) {
      const { data: res } = await this.$axios.post('/api/task/delete/' + row.id)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('删除任务【' + row.taskname + '】')
      this.getTaskList()
    },
    async deleteTaskByBatch () {
      const tasks = []
      this.multipleSelection.forEach(item => {
        tasks.push(item.id)
      })
      const { data: res } = await this.$axios.post('/api/task/delete', { tasks: tasks })
      if (!res.success) return this.$message.error(res.errCode)
      this.success('批量删除任务成功')
      this.getTaskList()
    },
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.getTaskList()
    },
    handleCurrentChange (val) {
      this.page = val
      this.getTaskList()
      console.log(`当前页: ${val}`)
    },
    toggleSelection (row, column, event) {
      if (column.no <= 1) {
        if (row) {
          this.$refs.multipleTable.toggleRowSelection(row)
        } else {
          this.$refs.multipleTable.clearSelection()
        }
      }
    },
    toggleDblClick (row, column, event) {
      window.open(this.$router.resolve({ path: '/task/' + row.id }).href)
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    async getWorkerList () {
      const { data: res } = await this.$axios.get('/api/system/worker/list', { params: { status: true } })
      if (!res.success) return this.$message.error(res.errCode)
      console.log(res.data)
      res.data.forEach(item => {
        this.optionsWorker[item.id] = item.name
      })
      console.log(this.optionsWorker)
    },
    async getExampleList () {
      const { data: res } = await this.$axios.get('/api/example/list?testname=&modules=&creator=&status=&pageSize=50&page=1')
      if (!res.success) return this.$message.error(res.errCode)
      this.testData = []
      res.data.datas.forEach(item => {
        this.testData.push({
          label: item.testname,
          key: item.id,
          spell: item.testname
        })
      })
    }
  }
}
</script>

<style scoped>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 14px;
}

.status {
  font-size: 20px;
}
.el-icon-success {
  color: #67c23a;
}
.el-icon-error {
  color: #f56c6c;
}
.icon {
  font-size: 14px;
}
</style>
