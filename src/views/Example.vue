<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/example' }">用例</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 查询框 -->
    <el-row :gutter="10">
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
      <el-col :span="3">
        <el-button type="primary" @click="dialogVisible=true" size='mini'>新增用例</el-button>
        <el-button type="warning" :disabled="multipleSelection.length<=0" @click="tempTaskDialogVisible=true" size='mini'>执行临时任务</el-button>
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
      <el-table-column prop="testname" label="名称"></el-table-column>
      <el-table-column prop="function" label="函数名"></el-table-column>
      <el-table-column prop="module" label="所属模块"></el-table-column>
      <el-table-column prop="creator" label="创建人" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <i class="status el-icon-success" v-if="scope.row.status==='success'" title="成功"></i>
          <i class="status el-icon-error" v-if="scope.row.status==='error'" title="错误"></i>
          <i class="status el-icon-error" v-if="scope.row.status==='fail'" title="失败"></i>
          <i class="status el-icon-loading" v-if="scope.row.status==='running'" title="执行中"></i>
          <i class="status el-icon-loading" v-if="scope.row.status==='pending'" title="等待执行"></i>
          <!-- <i
            :class="'status el-icon-' + (scope.row.status ? 'success' : 'error')"
          ></i> -->
        </template>
      </el-table-column>
      <el-table-column prop="execute_time" label="执行时间" width="200"></el-table-column>
      <el-table-column prop="elapse_time" label="耗时" width="120"></el-table-column>
      <el-table-column prop="operate" label="操作" width="150">
        <template #default="scope">
          <el-button size="mini" @click="handleDetail(scope.$index, scope.row)" icon="el-icon-s-order" class="icon" circle></el-button>
          <el-popconfirm
            :title="'确定删除用例【'+scope.row.testname+'】吗？'"
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
      title="是否确定执行临时任务？"
      v-model="tempTaskDialogVisible"
      width="50%"
      >
      <el-form ref="tempTaskRef" :model="tempTaskForm" :rules="rules" label-width="80px">
        <el-form-item label="Worker" prop="worker">
          <el-select v-model="tempTaskForm.worker" placeholder="Worker" style="width: 100%">
            <el-option
              v-for="item in optionsWorker"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
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
      testname: '',
      currentPage: 1,
      pageSize: 20,
      total: 0,
      multipleSelection: [],
      tableData: [],
      dialogVisible: false,
      tempTaskDialogVisible: false,
      addExampleForm: {
        testname: '',
        module: '',
        function: '',
        description: ''
      },
      tempTaskForm: {
        description: '',
        worker: null
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
      optionsModules: [],
      optionsCreator: [],
      optionsWorker: [],
      optionsStatus: [{
        value: 'success',
        label: '成功'
      }, {
        value: 'fail',
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
    async getExampleList () {
      const { data: res } = await this.$axios.get('/example/list',
        { params: { testname: this.testname, modules: this.modules.join(','), creator: this.creator.join(','), status: this.status.join(','), pageSize: this.pageSize, page: this.currentPage } })
      // { params: { name: this.name, modules: this.modules.join(','), creator: this.creator.join(','), status: this.status.join(',') } })
      if (!res.success) return this.$message.error(res.errCode)
      this.tableData = res.data.datas
      this.total = res.data.total
    },
    async getOptions () {
      const { data: res } = await this.$axios.get('/example/options')
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
      const { data: res } = await this.$axios.get('/system/worker/list', { params: { status: true } })
      if (!res.success) return this.$message.error(res.errCode)
      res.data.forEach(item => {
        this.optionsWorker.push({ value: item.id, label: item.name + '  [' + item.ip + ':' + item.port + ']' })
      })
      console.log(this.optionsWorker)
    },
    addExample () {
      this.$refs.addExampleRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$axios.post('/example/add', this.addExampleForm)
        if (!res.success) return this.$message.error(res.errCode)
        this.getExampleList()
        this.dialogVisible = false
      })
    },
    async execTempTask () {
      var content = []
      this.multipleSelection.forEach(item => {
        content.push(item.id)
      })
      console.log(content)
      const { data: res } = await this.$axios.post('/task/execTemplateTask', { taskname: null, description: this.tempTaskForm.description, creator: '邵俊凯', worker: this.tempTaskForm.worker, content: content })
      if (!res.success) return this.$message.error(res.errCode)
      this.success('创建临时任务成功')
      this.$refs.multipleTable.clearSelection()
      this.tempTaskDialogVisible = false
    },
    dialogClosed () {
      this.$refs.addExampleRef.resetFields() // 为什么resetFields无效?
      this.addExampleForm = {}
    },
    handleDetail (index, row) {
      console.log(index)
      console.log(row)
      this.$router.push('/example/' + row.id)
    },
    async handleDelete (index, row) {
      const { data: res } = await this.$axios.post('/example/delete/' + row.id)
      if (!res.success) return this.$message.error(res.errCode)
      this.success('删除测试用例【' + row.testname + '】')
      this.getExampleList()
    },
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.getExampleList()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getExampleList()
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
.icon {
  font-size: 14px;
}
</style>
