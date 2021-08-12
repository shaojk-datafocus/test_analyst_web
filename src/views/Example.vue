<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/example' }">用例</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 查询框 -->
    <el-row :gutter="10" style="margin-bottom:10px">
      <el-col :span="6">
        <el-input
          placeholder="按名称搜索"
          v-model="testname"
          class="input-with-select"
          clearable
          size='mini'
          @change="getExampleList"
        >
        </el-input>
      </el-col>
      <el-col :span="6">
        <el-select v-model="modules" multiple placeholder="所属模块" size='mini' style="width: 100%" filterable @change="getExampleList">
          <el-option
            v-for="item in optionsModules"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="creator" multiple placeholder="创建者" size='mini' style="width: 100%" filterable @change="getExampleList">
          <el-option
            v-for="item in optionsCreator"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="status" multiple placeholder="状态" size='mini' style="width: 100%" @change="getExampleList">
          <el-option
            v-for="item in optionsStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" :disabled="multipleSelection.length<=0" @click="taskDialogVisible=true" size='mini'>创建任务</el-button>
        <el-button @click="dialogVisible=true" size='mini'>新增用例</el-button>
        <el-popconfirm :title="'确定删除所有选中用例吗？'" @confirm="deleteTestByBatch">
          <template #reference>
            <el-button type="danger" size="mini" :disabled="multipleSelection.length<=0">删除用例</el-button>
          </template>
        </el-popconfirm>
      </el-col>
    </el-row>
    <!-- 分支标签页 -->
    <el-tabs v-model="editableTabsValue" type="card" @tab-click="handleTab">
      <el-tab-pane
        v-for="item in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
      >
      </el-tab-pane>
    </el-tabs>
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
      <el-table-column prop="testname" label="名称" sortable></el-table-column>
      <el-table-column prop="function" label="函数名" sortable></el-table-column>
      <el-table-column prop="module" label="所属模块" sortable></el-table-column>
      <el-table-column prop="creator" label="创建人" sortable width="120"></el-table-column>
      <el-table-column prop="status" label="状态" sortable width="120">
        <template #default="scope">
          <i class="status el-icon-success" v-if="scope.row.status==='success'" title="成功"></i>
          <i class="status el-icon-warning" v-if="scope.row.status==='error'" title="错误"></i>
          <i class="status el-icon-error" v-if="scope.row.status==='failed'" title="失败"></i>
          <i class="status el-icon-loading" v-if="scope.row.status==='running'" title="执行中"></i>
          <i class="status el-icon-more" v-if="scope.row.status==='pending'" title="等待执行"></i>
        </template>
      </el-table-column>
      <el-table-column prop="execute_time" label="执行时间" sortable width="200"></el-table-column>
      <el-table-column prop="elapse_time" label="耗时" sortable width="120"></el-table-column>
      <el-table-column prop="operate" label="操作" width="150">
        <template #default="scope">
          <el-button size="mini" @click="handleDetail(scope.$index, scope.row)" icon="el-icon-s-order" class="icon" circle></el-button>
          <el-popconfirm
            :title="'确定删除用例【'+scope.row.testname+'】吗？'"
            @confirm="handleDelete(scope.$index, scope.row)"
          >
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
    <!-- 新增用例弹框 -->
    <el-dialog
      title="新增用例"
      v-model="dialogVisible"
      width="50%"
      @closed="dialogClosed()"
      >
      <el-form ref="addExampleRef" :model="addExampleForm" :rules="rules" label-width="80px">
        <el-form-item label="用例名称" prop="testname" >
          <el-input v-model="addExampleForm.testname" placeholder="请输入用例名称"></el-input>
        </el-form-item>
        <el-form-item label="模块路径" prop="module">
          <el-input v-model="addExampleForm.module" placeholder="例: hlt.v5.example.testCollection"></el-input>
        </el-form-item>
        <el-form-item label="函数名" prop="function">
          <el-input v-model="addExampleForm.function" placeholder="例: test_example_01"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="addExampleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addExample">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 执行临时任务弹框 -->
    <el-dialog
      title="创建任务"
      v-model="taskDialogVisible"
      width="50%"
      @open="initTaskDialog"
      >
      <el-form ref="taskRef" :model="taskForm" :rules="taskRules" label-width="80px">
        <el-row :gutter="10">
          <el-col :span="14">
            <el-form-item label="名称" prop="description">
              <el-input v-model="taskForm.taskname"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="Tag" prop="tag_id">
              <el-select v-model="taskForm.tag_id" clearable style="width: 100%">
                <el-option
                  v-for="item in optionsTags"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="14">
            <el-form-item label="站点" prop="host">
              <el-input v-model="taskForm.host"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="Worker" prop="worker_id">
              <el-cascader
                v-model="taskForm.worker"
                :options="optionsWorker"
                :props="{ expandTrigger: 'hover' }"
                filterable clearable
                style="width: 100%">
              </el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="taskForm.description" :autosize="{minRows: 1, maxRows: 6}"></el-input>
        </el-form-item>
        <el-form-item label="定时任务" prop="schedule">
          <el-input type="textarea" v-model="taskForm.schedule" :autosize="{minRows: 1, maxRows: 6}"></el-input>
        </el-form-item>
        <el-form-item label="SQL策略" prop="sql_strategy">
          <el-input type="textarea" v-model="taskForm.sql_strategy" :autosize="{minRows: 1, maxRows: 6}"></el-input>
        </el-form-item>
        <el-form-item label="用例列表" prop="content">
           <el-table
              :data="taskForm.content"
              style="width: 100%"
              max-height="350"
              size="mini">
              <el-table-column
                fixed
                prop="testname"
                label="名称"
                width="150">
              </el-table-column>
              <el-table-column
                prop="function"
                label="函数名">
              </el-table-column>
              <el-table-column
                prop="module"
                label="模块">
              </el-table-column>
              <el-table-column
                prop="creator"
                label="创建者">
              </el-table-column>
              <el-table-column
                fixed="right"
                label="操作">
                <template #default="scope">
                  <el-button
                    @click.prevent="deleteRow(scope.$index, taskForm.content)"
                    type="text"
                    size="small">
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="taskDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addTask">保 存</el-button>
          <el-button type="warning" @click="addTaskAndExecute">保 存 并 执 行</el-button>
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
      testname: '',
      page: 1,
      pageSize: 20,
      total: 0,
      multipleSelection: [],
      tableData: [],
      dialogVisible: false,
      taskDialogVisible: false,
      editableTabsValue: 'All',
      editableTabs: [],
      tabIndex: 2,
      addExampleForm: {
        testname: '',
        module: '',
        function: '',
        description: ''
      },
      taskForm: {
        taskname: '临时任务'
      },
      rules: {
        testname: [
          { required: true, message: '请输入用例名称', trigger: 'blur' }
        ],
        module: [
          { required: true, message: '请输入用例所在模块路径', trigger: 'blur' }
        ],
        function: [
          { required: true, message: '请输入用例的函数名', trigger: 'blur' }
        ]
      },
      taskRules: {
        taskname: [
          { required: true, message: '请输入任务名称', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '用例不能为空', trigger: 'blur' }
        ]
      },
      optionsModules: [],
      optionsCreator: [],
      optionsWorker: [],
      optionsTags: [],
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
    this.getTagList()
    this.getExampleList()
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
    async getTagList () {
      const { data: res } = await this.$axios.get('/api/tag/list')
      if (!res.success) return this.$message.error(res.errCode)
      this.optionsTags = []
      const tabs = [{ title: '全部', name: 'All', content: '全部' }]
      res.data.forEach(tag => {
        tabs.push({ title: tag.name, name: tag.id.toString(), content: tag.name })
        this.optionsTags.push({ value: tag.id, label: tag.name })
      })
      this.editableTabs = tabs
    },
    async getExampleList () {
      const { data: res } = await this.$axios.get('/api/example/list',
        { params: { testname: this.testname, modules: this.modules.join(','), creator: this.creator.join(','), status: this.status.join(','), tag: this.editableTabsValue, pageSize: this.pageSize, page: this.page } })
      if (!res.success) return this.$message.error(res.errCode)
      res.data.datas.forEach(item => {
        let et = item.elapse_time
        const second = parseInt(et % 60)
        item.elapse_time = second + 's'
        et = parseInt(et / 60)
        if (et > 0) {
          item.elapse_time = et + 'min'
          if (second > 0) {
            item.elapse_time += ' ' + second + 's'
          }
        } else {
          item.elapse_time = second + 's'
        }
      })
      this.tableData = res.data.datas
      this.total = res.data.total
    },
    async getOptions () {
      const { data: res } = await this.$axios.get('/api/example/options')
      if (!res.success) return this.$message.error(res.errCode)
      this.optionsModules = []
      this.optionsCreator = []
      res.data.module.forEach(item => {
        this.optionsModules.push({ value: item, label: item })
      })
      res.data.creator.forEach(item => {
        this.optionsCreator.push({ value: item, label: item })
      })
    },
    async getWorkerList () {
      const { data: res } = await this.$axios.get('/api/system/worker/list', { params: { status: true } })
      if (!res.success) return this.$message.error(res.errCode)
      res.data.forEach(item => {
        const branch = []
        for (const key in JSON.parse(item.branch)) {
          branch.push({ value: key, label: key })
        }
        this.optionsWorker.push({ value: item.id, label: item.name + '  <' + item.ip + '>', children: branch })
      })
    },
    async addExample () {
      this.$refs.addExampleRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('/api/example/add', this.addExampleForm)
        if (!res.success) return this.$message.error(res.errCode)
        this.getExampleList()
        this.dialogVisible = false
      })
    },
    async addTask () {
      const content = []
      if ('worker' in this.taskForm) {
        this.taskForm.branch = this.taskForm.worker[1]
        this.taskForm.worker_id = this.taskForm.worker[0]
      }
      delete this.taskForm.worker
      this.taskForm.content.forEach(item => {
        content.push(item.id)
      })
      this.taskForm.content = content.join(',')
      const { data: res } = await this.$axios.post('/api/task/add', this.taskForm)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('创建任务成功')
      this.$refs.multipleTable.clearSelection()
      this.taskDialogVisible = false
      this.taskForm = {}
    },
    async addTaskAndExecute () {
      const content = []
      if ('worker' in this.taskForm) {
        this.taskForm.branch = this.taskForm.worker[1]
        this.taskForm.worker_id = this.taskForm.worker[0]
      } else {
        this.error('执行任务必须指定Worker')
        return 0
      }
      this.taskForm.branch = this.taskForm.worker[1]
      this.taskForm.worker_id = this.taskForm.worker[0]
      this.taskForm.content.forEach(item => {
        content.push(item.id)
      })
      this.taskForm.content = content.join(',')
      const { data: res } = await this.$axios.post('/api/task/add/trigger', this.taskForm)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('开始执行任务【' + res.data.taskname + '】')
      this.$refs.multipleTable.clearSelection()
      this.taskDialogVisible = false
      this.taskForm = {}
    },
    dialogClosed () {
      this.$refs.addExampleRef.resetFields() // 为什么resetFields无效?
      this.addExampleForm = {}
    },
    initTaskDialog () {
      this.taskForm.taskname = '临时任务-' + Date().toString().slice(0, -18)
      this.taskForm.content = []
      this.multipleSelection.forEach(item => {
        this.taskForm.content.push(item)
      })
    },
    handleDetail (index, row) {
      // this.$router.push('/example/' + row.id)
      const routeData = this.$router.resolve({ path: '/example/' + row.id })
      window.open(routeData.href)
    },
    async handleDelete (index, row) {
      const { data: res } = await this.$axios.post('/api/example/delete/' + row.id)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('删除测试用例【' + row.testname + '】')
      this.getExampleList()
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.getExampleList()
    },
    handleCurrentChange (val) {
      this.page = val
      this.getExampleList()
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
      const routeData = this.$router.resolve({ path: '/example/' + row.id })
      window.open(routeData.href)
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    handleTab () {
      this.getExampleList()
    },
    async deleteTestByBatch () {
      const tests = []
      this.multipleSelection.forEach(item => {
        tests.push(item.id)
      })
      const { data: res } = await this.$axios.post('/api/example/delete', { tests: tests })
      if (!res.success) return this.$message.error(res.errCode)
      this.success('批量删除用例成功')
      this.getTaskList()
    }
  }
}
</script>

<style>
.el-tabs__item {
  height: 32px !important;
  line-height: 32px !important;
}
.el-tabs__header {
  margin: 0 !important;
}
</style>
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
  /* color: #f56c6c; */
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
