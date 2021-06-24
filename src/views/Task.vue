<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/task' }">任务</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 查询框 -->
    <el-row :gutter="10">
      <el-col :span="12">
        <el-input
          placeholder="请输入内容"
          v-model="search"
          class="input-with-select"
          clearable
        >
          <template #append>
            <el-button icon="el-icon-search"></el-button>
          </template>
        </el-input>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="dialogVisible=true">新建任务</el-button>
        <el-button type="warning" :disabled="multipleSelection.length<=0" @click="tempTaskDialogVisible=true">执行任务</el-button>
        <el-button type="danger" :disabled="multipleSelection.length<=0" @click="tempTaskDialogVisible=true">删除任务</el-button>
        <el-button @click="dialogVisible=true">导入任务</el-button>
      </el-col>
    </el-row>
    <!-- 用例内容表格展示 -->
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @row-dblclick="toggleSelection"
      size="mini"
    >
      <el-table-column type="selection" width="36"></el-table-column>
      <el-table-column prop="taskname" label="名称"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="creator" label="创建人"></el-table-column>
      <el-table-column prop="execute_time" label="计划执行时间">2021-06-24 16:24</el-table-column>
      <el-table-column prop="content" label="包含用例数量">15</el-table-column>
      <el-table-column prop="elapse_time" label="耗时">14min</el-table-column>
      <el-table-column prop="operate" label="操作" width="250">
        <template #default="scope">
          <el-popconfirm :title="'是否执行任务【'+scope.row.taskname+'】吗？'" @confirm="handleExecute(scope.$index, scope.row)">
            <template #reference>
              <el-button size="mini" type="success">执行</el-button>
            </template>
          </el-popconfirm>
          <el-button size="mini" @click="handleDetail(scope.$index, scope.row)">查看</el-button>
          <el-popconfirm :title="'确定删除任务【'+scope.row.taskname+'】吗？'" @confirm="handleDelete(scope.$index, scope.row)">
            <template #reference>
              <el-button size="mini" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-size="100"
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
          <el-button type="primary" @click="execTempTask">确 定</el-button>
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
      search: '',
      currentPage: 1,
      total: 256,
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
      }
    }
  },
  created () {
    this.getTaskList()
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
      const { data: res } = await this.$axios.get('/task/list')
      if (!res.success) return this.$message.error(res.errCode)
      this.tableData = res.data
      console.log(res.data)
    },
    addTask () {
      this.$refs.addTaskRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$axios.post('/task/add', this.addTaskForm)
        if (!res.success) return this.$message.error(res.errCode)
        this.getTaskList()
        this.dialogVisible = false
      })
    },
    async execTempTask () {
      var content = []
      this.multipleSelection.forEach(item => {
        content.push(item.id)
      })
      console.log(content)
      const { data: res } = await this.$axios.post('/task/execTemplateTask', { taskname: null, description: this.tempTaskForm.description, creator: '阿斯蒂芬', content: content })
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
      console.log(index)
      console.log(row)
      this.$router.push('/task/' + row.id)
    },
    async handleExecute (index, row) {
      const { data: res } = await this.$axios.post('/task/execute/' + row.id)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('开始执行任务【' + row.taskname + '】')
    },
    async handleDelete (index, row) {
      const { data: res } = await this.$axios.post('/task/delete/' + row.id)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('删除任务【' + row.taskname + '】')
      this.getTaskList()
    },
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`)
    },
    toggleSelection (row, column, event) {
      if (row) {
        this.$refs.multipleTable.toggleRowSelection(row)
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange (val) {
      console.log(val)
      console.log(typeof val)
      this.multipleSelection = val
      console.log(this.multipleSelection)
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
</style>
