<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/task' }">用例</el-breadcrumb-item>
      <el-breadcrumb-item>{{ taskForm.taskname }}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row :gutter="20">
        <!-- 用例信息 -->
        <el-col :span="11">
            <el-form ref="taskRef" :model="taskForm" :rules="rules" label-width="80px" :disabled='!editable' label-position="top">
                <el-form-item label="任务名称" prop="taskname" >
                    <el-input v-model="taskForm.taskname" placeholder="请输入用例名称"></el-input>
                </el-form-item>
                <el-form-item label="创建者" prop="creator">
                    <el-input v-model="taskForm.creator" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" v-model="taskForm.description" :autosize="{ minRows: 6}"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="content">
                    <el-input type="textarea" v-model="taskForm.description" :autosize="{ minRows: 6}"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" ref="saveTask" @click="saveTask" :disabled="!editable">保存配置</el-button>
                    <el-button type="danger" @click="deleteTask" :disabled="!editable">删除</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!-- 用例执行记录 -->
        <el-col :span="13">
          <el-table
            :data="recordData"
            style="width: 100%">
            <el-table-column type="expand">
              <template #default="props">
                <el-form label-position="left" inline class="demo-table-expand">
                  <el-form-item label="ID">
                    <span>{{ props.row.id }}</span>
                  </el-form-item>
                  <el-form-item label="执行状态">
                    <span>{{ props.row.status }}</span>
                  </el-form-item>
                  <el-form-item label="用时">
                    <span>{{ props.row.elapse_time }}</span>
                  </el-form-item>
                  <el-form-item label="所属任务 ID">
                    <span>{{ props.row.task_id }}</span>
                  </el-form-item>
                  <el-form-item label="起始时间">
                    <span>{{ props.row.start_time }}</span>
                  </el-form-item>
                  <el-form-item label="结束时间">
                    <span>{{ props.row.end_time }}</span>
                  </el-form-item>
                  <!-- <div v-if="props.row.info"> -->
                    <div><strong>命令行信息</strong></div>
                    <!-- <p v-for="(row, i) in props.row.info.location" :key="i">
                      {{ row }}
                    </p> -->
                    <el-input readonly
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 20}"
                      v-model="props.row.info">
                    </el-input>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column
              label="执行 ID"
              prop="id">
            </el-table-column>
            <el-table-column
              label="执行状态"
              prop="status">
            </el-table-column>
            <el-table-column
              label="用时"
              prop="elapse_time">
            </el-table-column>
            <el-table-column
              label="执行时间"
              prop="start_time">
            </el-table-column>
          </el-table>
        </el-col>
    </el-row>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'

export default {
  data () {
    return {
      editable: false,
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
      recordData: []
    }
  },
  created () {
    this.getTaskDetail(this.$route.params.id)
    console.log(this.$route.params.id)
    console.log('到了?')
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
      const { data: res } = await this.$axios.get('/task/' + id)
      if (!res.success) return this.$message.error(res.errCode)
      this.taskForm = res.data
      this.editable = true
      console.log(this.taskForm)
    },
    async getTaskRecord (id) {
      const { data: res } = await this.$axios.get('/task/' + id + '/record')
      if (!res.success) return this.$message.error(res.errCode)
      this.recordData = []
      res.data.forEach((record) => {
        let info
        if (record.info) {
          info = JSON.parse(record.info)
        } else {
          info = {}
        }
        record.info = ''
        if (Object.keys(info).length > 0) {
          record.info = info.type + '\n' + info.info + '\n'
          info.location.forEach((row) => {
            record.info += row
          })
        }
        const et = record.elapse_time
        let elapseTime = ''
        if (parseInt(et / 60) > 0) {
          elapseTime += parseInt(et / 60) + 'min '
        }
        if (parseInt(et % 60) > 0) {
          elapseTime += parseInt(et % 60) + 's'
        }
        record.elapse_time = elapseTime
        this.recordData.push(record)
      })
      console.log(this.recordData)
    },
    async saveTask () {
      const { data: res } = await this.$axios.post('/task/update', {
        id: this.taskForm.id,
        taskname: this.taskForm.taskname,
        module: this.taskForm.module,
        function: this.taskForm.function,
        creator: this.taskForm.creator,
        description: this.taskForm.description
      })
      if (!res.success) return this.$message.error(res.errCode)
      this.success('保存用例成功')
      this.$router.push('/task')
    },
    async deleteTask () {
      const { data: res } = await this.$axios.post('/task/delete/' + this.taskForm.id)
      if (!res.success) return this.error(res.errCode)
      this.success('删除用例成功')
      this.$router.push('/task')
    }
  }
}
</script>

<style scoped>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 14px;
}
</style>
