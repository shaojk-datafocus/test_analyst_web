<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/task' }">任务</el-breadcrumb-item>
      <el-breadcrumb-item>{{ taskForm.taskname }}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-form ref="taskRef" :model="taskForm" :rules="rules" label-width="80px" :disabled='!editable' label-position="top">
      <el-row :gutter="20">
          <!-- 用例信息 -->
          <el-col :span="12">
            <el-form-item label="任务名称" prop="taskname" >
                <el-input v-model="taskForm.taskname" placeholder="请输入用例名称"></el-input>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="14">
                <el-form-item label="Worker" prop="worker">
                  <el-cascader
                    v-model="taskForm.worker"
                    :options="optionsWorker"
                    :props="{ expandTrigger: 'hover' }"
                    filterable clearable
                    style="width: 100%">
                  </el-cascader>
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="创建者" prop="creator">
                    <el-input v-model="taskForm.creator" placeholder=""></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="14">
                <el-form-item label="站点" prop="host">
                    <el-input v-model="taskForm.host"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="下一个执行" prop="next_task">
                    <el-select v-model="taskForm.next_task" filterable clearable placeholder="请选择" style="width: 100%" ref="optionsTaskRef">
                      <el-option
                        v-for="item in optionsTask"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="10">
                <el-form-item label="上一个执行">
                  <div v-if="lastTask">
                    <a :href="'#/task/'+lastTask.id">{{lastTask? lastTask.taskname:'  空  ' }}</a>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="下一个执行">
                  <div v-if="nextTask">
                    <a :href="'#/task/'+nextTask.id">{{nextTask? nextTask.taskname:'  空  ' }}</a>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="SQL策略" prop="sql_strategy">
              <span style="margin-right:15px">SELECT * FROM focus_test WHERE {{taskForm.sql_strategy}}</span><el-button size="small" @click="renderStrategy">验证策略</el-button>
                <el-input v-model="taskForm.sql_strategy" placeholder="例：module='hlt.v5.chart.testCollection'"></el-input>
            </el-form-item>
            <el-form-item label="执行计划" prop="schedule">
                <el-input type="textarea" v-model="taskForm.schedule" :autosize="{ minRows: 2}" placeholder='例：{"day_of_week":"0-6", "hour":18, "minute":20, "second":10}'></el-input>
            </el-form-item>
            <el-form-item label="描述" prop="description">
                <el-input type="textarea" v-model="taskForm.description" :autosize="{ minRows: 2}"></el-input>
            </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内容" prop="content">
                <el-transfer
                  ref="transferContent"
                  v-model="taskForm.content"
                  filterable
                  :titles="['全部', '已部署']"
                  :filter-method="filterMethod"
                  filter-placeholder="请输入用例名称"
                  :data="testData"
                  style="width:100%"
                />
              </el-form-item>
            </el-col>
        </el-row>
      <el-form-item>
          <el-button type="primary" ref="saveTask" @click="saveTask" :disabled="!editable">保存配置</el-button>
          <el-button type="warning" @click="handlerExecute">执行任务</el-button>
          <el-button type="danger" @click="deleteTask" :disabled="!editable">删除</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'

export default {
  data () {
    return {
      testData: [],
      filterMethod (query, item) {
        return item.spell.indexOf(query) > -1
      },
      editable: false,
      lastTask: null,
      nextTask: null,
      taskForm: {},
      rules: {
        taskname: [
          { required: true, message: '请输入用例名称', trigger: 'blur' }
        ],
        module: [
          { required: true, message: '请输入用例所在模块路径', trigger: 'blur' }
        ],
        function: [
          { required: true, message: '请输入用例的函数名', trigger: 'blur' }
        ]
      },
      optionsWorker: [],
      optionsTask: []
    }
  },
  created () {
    this.getTaskList()
    this.getTaskDetail(this.$route.params.id)
    this.getWorkerList()
    this.getExampleList()
  },
  watch: {
    $route () {
      // 跳转到该页面后需要进行的操作
      this.getTaskDetail(this.$route.params.id)
    }
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
    async getTaskDetail (id) {
      const { data: res } = await this.$axios.get('/api/task/' + id)
      if (!res.success) return this.$message.error(res.errCode)
      this.taskForm = res.data
      this.taskForm.worker = [this.taskForm.worker_id, this.taskForm.branch]
      const content = []
      if (res.data.content) {
        res.data.content.split(',').forEach(i => {
          content.push(parseInt(i))
        })
      }
      this.taskForm.content = content
      this.editable = true
      const options = this.$refs.optionsTaskRef.options
      console.log(this.taskForm)
      this.nextTask = this.taskForm.next_task ? { id: this.taskForm.next_task, taskname: options.get(this.taskForm.next_task).currentLabel } : null
      this.lastTask = this.taskForm.last_task ? { id: this.taskForm.last_task, taskname: options.get(this.taskForm.last_task).currentLabel } : null
    },
    async saveTask () {
      this.taskForm.branch = this.taskForm.worker[1]
      this.taskForm.worker_id = this.taskForm.worker[0]
      const { data: res } = await this.$axios.post('/api/task/update', this.taskForm)
      if (!res.success) return this.$message.error(res.errCode)
      this.refreshNext()
      this.success('保存用例成功')
    },
    handlerExecute () {
      this.$confirm('执行任务前，请确定已保存任务?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.executeTask()
      }).catch(() => {})
    },
    async executeTask () {
      this.taskForm.branch = this.taskForm.worker[1]
      this.taskForm.worker_id = this.taskForm.worker[0]
      const { data: res } = await this.$axios.post('/api/task/trigger/' + this.taskForm.id)
      if (!res.success) return this.error('执行任务失败【' + this.taskForm.taskname + '】')
      this.success('开始执行任务【' + this.taskForm.taskname + '】')
    },
    async deleteTask () {
      const { data: res } = await this.$axios.post('/api/task/delete/' + this.taskForm.id)
      if (!res.success) return this.error(res.errCode)
      this.success('删除用例成功')
      this.$router.push('/task')
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
    async getExampleList () {
      const { data: res } = await this.$axios.get('/api/example/list?testname=&modules=&creator=&status=&pageSize=300&page=1')
      if (!res.success) return this.$message.error(res.errCode)
      this.testData = []
      res.data.datas.forEach(item => {
        this.testData.push({
          label: item.testname,
          key: item.id,
          spell: item.testname
        })
      })
    },
    getTaskList () {
      this.$axios.get('/api/task/list?taskname=&pageSize=100&page=1').then(res => {
        if (!res.data.success) return this.$message.error(res.errCode)
        res.data.data.datas.forEach(item => {
          this.optionsTask.push({ value: item.id, label: item.taskname })
        })
      }).catch(err => {
        console.log(err)
      })
    },
    refreshNext () {
      const ref = this.$refs.optionsTaskRef.selected
      this.nextTask = { id: ref.value, taskname: ref.currentLabel }
    },
    async renderStrategy () {
      const { data: res } = await this.$axios.post('/api/task/strategy/render', { sql_strategy: this.taskForm.sql_strategy })
      if (!res.success) return this.error('验证SQL策略失败')
      this.success('策略已生成')
      this.taskForm.content = res.data
    }
  }
}
</script>

<style scoped>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 14px;
}
.el-button {
  text-overflow : ellipsis;
  overflow: hidden;
  white-space:nowrap;
}
</style>
