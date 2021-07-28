<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/strategy' }">策略</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 查询框 -->
    <el-row :gutter="10">
      <el-col :span="6">
        <el-input
          placeholder="按名称搜索"
          v-model="name"
          class="input-with-select"
          clearable
          size='mini'
          @change="getStrategyList"
        >
        </el-input>
      </el-col>
      <el-col :span="3">
        <el-select v-model="creator" multiple placeholder="创建者" size='mini' style="width: 100%" filterable @change="getStrategyList">
          <el-option
            v-for="item in optionsCreator"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="status" multiple placeholder="状态" size='mini' style="width: 100%" @change="getStrategyList">
          <el-option
            v-for="item in optionsStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="dialogVisible=true" size='mini'>创建策略</el-button>
        <el-popconfirm :title="'确定删除所有选中策略吗？'" @confirm="deleteTestByBatch">
          <template #reference>
            <el-button type="danger" size="mini" :disabled="multipleSelection.length<=0">删除策略</el-button>
          </template>
        </el-popconfirm>
      </el-col>
    </el-row>
    <!-- 策略内容表格展示 -->
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @row-click="toggleSelection"
      @row-dblclick="toggleDblClick"
      size="mini"
    >
      <el-table-column type="selection" width="36"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="creator" label="创建人" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="120"></el-table-column>
      <el-table-column prop="operate" label="操作" width="150">
        <template #default="scope">
          <el-button size="mini" @click="handleDetail(scope.$index, scope.row)" icon="el-icon-s-order" class="icon" circle></el-button>
          <el-popconfirm
            :title="'确定删除策略【'+scope.row.name+'】吗？'"
            @confirm="handleDelete(scope.$index, scope.row)"
          >
            <template #reference>
              <el-button size="mini" icon="el-icon-remove-outline" class="icon" circle></el-button>
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
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    <!-- 新增策略弹框 -->
    <el-dialog
      title="新增策略"
      v-model="dialogVisible"
      width="50%"
      @closed="dialogClosed()"
      >
      <el-form ref="addStrategyRef" :model="addStrategyForm" :rules="rules" label-width="80px">
        <el-form-item label="策略名称" prop="name" >
          <el-input v-model="addStrategyForm.name" placeholder="请输入策略名称"></el-input>
        </el-form-item>
        <el-form-item label="策略内容" prop="content">
          <el-input type="textarea" v-model="addStrategyForm.content"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="addStrategyForm.description"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addStrategy">确 定</el-button>
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
      name: '',
      currentPage: 1,
      pageSize: 20,
      total: 0,
      multipleSelection: [],
      tableData: [],
      dialogVisible: false,
      addStrategyForm: {
        name: '',
        module: '',
        function: '',
        description: ''
      },
      taskForm: {
        taskname: '临时任务'
      },
      rules: {
        name: [
          { required: true, message: '请输入策略名称', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入策略内容，内容为可执行SQL语句', trigger: 'blur' }
        ]
      },
      optionsCreator: [],
      optionsWorker: [],
      optionsStatus: [{
        value: 'success',
        label: '成功'
      }, {
        value: 'failed',
        label: '失败'
      }, {
        value: 'error',
        label: '错误'
      }, {
        value: 'running',
        label: '执行中'
      }, {
        value: 'pending',
        label: '等待执行'
      }],
      modules: [],
      creator: [],
      status: []
    }
  },
  created () {
    this.getStrategyList()
    this.getOptions()
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
    async getStrategyList () {
      const { data: res } = await this.$axios.get('/api/strategy/list',
        { params: { name: this.name, modules: this.modules.join(','), creator: this.creator.join(','), status: this.status.join(','), pageSize: this.pageSize, page: this.currentPage } })
      if (!res.success) return this.$message.error(res.errCode)
      res.data.datas.forEach(item => {
        let et = item.elapse_time
        item.elapse_time = parseInt(et % 60) + 's'
        et = parseInt(et / 60)
        if (et > 0) {
          item.elapse_time = et + 'min ' + item.elapse_time
        }
      })
      this.tableData = res.data.datas
      this.total = res.data.total
    },
    async getOptions () {
      const { data: res } = await this.$axios.get('/api/strategy/options')
      if (!res.success) return this.$message.error(res.errCode)
      this.optionsCreator = []
      res.data.creator.forEach(item => {
        this.optionsCreator.push({ value: item, label: item })
      })
    },
    async getWorkerList () {
      const { data: res } = await this.$axios.get('/api/system/worker/list', { params: { status: true } })
      if (!res.success) return this.$message.error(res.errCode)
      res.data.forEach(item => {
        this.optionsWorker.push({ value: item.id, label: item.name + '  <' + item.ip + '  ' + item.branch + '>' })
      })
      console.log(this.optionsWorker)
    },
    async addStrategy () {
      this.$refs.addStrategyRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$axios.post('/api/strategy/add', this.addStrategyForm)
        if (!res.success) return this.$message.error(res.errCode)
        this.getStrategyList()
        this.dialogVisible = false
      })
    },
    dialogClosed () {
      this.$refs.addStrategyRef.resetFields() // 为什么resetFields无效?
      this.addStrategyForm = {}
    },
    initTaskDialog () {
      this.taskForm.taskname = '临时任务-' + Date().toString().slice(0, -18)
      this.taskForm.content = []
      this.multipleSelection.forEach(item => {
        this.taskForm.content.push(item)
      })
      console.log(this.taskForm.content)
    },
    handleDetail (index, row) {
      this.$router.push('/strategy/' + row.id)
    },
    async handleDelete (index, row) {
      const { data: res } = await this.$axios.post('/api/strategy/delete/' + row.id)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('删除测试策略【' + row.name + '】')
      this.getStrategyList()
    },
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.getStrategyList()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getStrategyList()
      console.log(`当前页: ${val}`)
    },
    deleteRow (index, rows) {
      rows.splice(index, 1)
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
      this.$router.push('/strategy/' + row.id)
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    async deleteTestByBatch () {
      const tests = []
      this.multipleSelection.forEach(item => {
        tests.push(item.id)
      })
      const { data: res } = await this.$axios.post('/api/strategy/delete', { tests: tests })
      if (!res.success) return this.$message.error(res.errCode)
      this.success('批量删除策略成功')
      this.getTaskList()
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
.el-icon-warning {
  color: #E6A23C;
}
.el-icon-more {
  color: #909399;
}
.icon {
  font-size: 14px;
}
</style>
