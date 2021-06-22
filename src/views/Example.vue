<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/example' }">用例</el-breadcrumb-item>
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
      <el-col :span="8">
        <el-button type="primary" @click="dialogVisible=true">新增用例</el-button>
        <el-button type="warning" :disabled="multipleSelection.length<=0" @click="tempTaskDialogVisible=true">执行临时任务</el-button>
      </el-col>
    </el-row>
    <!-- 用例内容表格展示 -->
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      size="mini"
    >
      <el-table-column type="selection" width="36"> </el-table-column>
      <el-table-column prop="testname" label="名称"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="creator" label="创建人"></el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <i
            :class="'status el-icon-' + (scope.row.status ? 'success' : 'error')"
          ></i>
        </template>
      </el-table-column>
      <el-table-column prop="execute_time" label="执行时间"></el-table-column>
      <el-table-column prop="elapse_time" label="耗时"></el-table-column>
      <el-table-column prop="operate" label="操作" width="150">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
          <el-popconfirm
            :title="'确定删除用例【'+scope.row.testname+'】吗？'"
            @confirm="handleDelete(scope.$index, scope.row)"
          >
          <template #reference>
          <el-button
            size="mini"
            type="danger"
            >删除</el-button>
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
      @closed="dialogClosed()"
      >
      <el-form ref="tempTaskRef" :model="tempTaskForm" :rules="rules" label-width="80px">
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="tempTaskForm.description"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addExample">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
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
      addExampleForm: {
        testname: '',
        module: '',
        function: '',
        description: ''
      },
      tempTaskForm: {},
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
      }
    }
  },
  created () {
    this.getExampleList()
  },
  methods: {
    async getExampleList () {
      const { data: res } = await this.$axios.get('/example/list')
      if (!res.success) return this.$message.error(res.errCode)
      this.tableData = res.data
      console.log(res.data)
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
      const { data: res } = await this.$axios.post('/task/createTemplateTask', { taskname: null, description: '', creator: '阿斯蒂芬', content: content })
      if (!res.success) return this.$message.error(res.errCode)
      console.log('addToTask Success')
    },
    dialogClosed () {
      this.$refs.addExampleRef.resetFields() // 为什么resetFields无效?
      this.addExampleForm = {}
    },
    handleEdit (index, row) {
      console.log(index)
      console.log(row)
      this.$router.push('/example/' + row.id)
    },
    async handleDelete (index, row) {
      const { data: res } = await this.$axios.post('/example/delete/' + row.id)
      if (!res.success) return this.$message.error(res.errCode)
      this.getExampleList()
    },
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`)
    },
    toggleSelection (rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
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
