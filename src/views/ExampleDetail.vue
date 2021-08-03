<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/example' }">用例</el-breadcrumb-item>
      <el-breadcrumb-item>{{ testForm.testname }}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row :gutter="20">
        <!-- 用例信息 -->
        <el-col :span="11">
            <el-form ref="testRef" :model="testForm" :rules="rules" label-width="80px" :disabled='!editable' label-position="top">
                <el-form-item label="用例名称" prop="testname" >
                    <el-input v-model="testForm.testname" placeholder="请输入用例名称"></el-input>
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="9">
                        <el-form-item label="模块路径" prop="module">
                            <el-input v-model="testForm.module" placeholder="例: hlt.v5.example.testCollection"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="9">
                        <el-form-item label="函数名" prop="function">
                            <el-input v-model="testForm.function" placeholder="例: test_example_01"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="创建者" prop="creator">
                            <el-input v-model="testForm.creator" placeholder=""></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" v-model="testForm.description" :autosize="{ minRows: 6}"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" ref="saveExample" @click="saveExample" :disabled="!editable">保存配置</el-button>
                    <el-button type="danger" @click="deleteExample" :disabled="!editable">删除</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!-- 用例执行记录 -->
        <el-col :span="13">
          <el-row>
            <el-table
              :data="recordData"
              style="width: 100%"
              height="500"
              >
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
                    <el-form-item label="所属任务">
                      <a :href="'#/task/'+props.row.task_id">{{ props.row.task_name }}</a>
                    </el-form-item>
                    <el-form-item label="分支">
                      <span>{{ props.row.branch }}</span>
                    </el-form-item>
                    <el-form-item label="起始时间">
                      <span>{{ props.row.start_time }}</span>
                    </el-form-item>
                    <el-form-item label="结束时间">
                      <span>{{ props.row.end_time }}</span>
                    </el-form-item>
                      <div><strong>命令行信息</strong></div>
                      <el-input readonly
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 20}"
                        v-model="props.row.info">
                      </el-input>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                label="执行时间"
                prop="start_time"
                min-width="100">
              </el-table-column>
              <el-table-column
                label="执行状态"
                prop="status">
              </el-table-column>
              <el-table-column
                label="执行站点"
                prop="host"
                min-width="100">
              </el-table-column>
              <el-table-column
                label="任务"
                prop="task" v-slot="scope" min-width="150">
                <a :href="'#/task/'+scope.row.task_id">{{ scope.row.task_name }}</a>
              </el-table-column>
              <el-table-column
                label="用时"
                prop="elapse_time">
              </el-table-column>
            </el-table>
            </el-row>
            <el-row>
              <div id="recordChart" style="width: 100%; height: 450px"></div>
            </el-row>
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
      testForm: {},
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
      recordData: []
    }
  },
  created () {
    this.getExampleDetail(this.$route.params.id)
    this.getExampleRecord(this.$route.params.id)
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
    async getExampleDetail (id) {
      const { data: res } = await this.$axios.get('/api/example/' + id)
      if (!res.success) return this.$message.error(res.errCode)
      this.testForm = res.data
      this.editable = true
      console.log(this.testForm)
    },
    async getExampleRecord (id) {
      const { data: res } = await this.$axios.get('/api/example/' + id + '/record')
      if (!res.success) return this.$message.error(res.errCode)
      this.recordData = []
      this.drawRecord(res.data)
      console.log(res.data)
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
    async saveExample () {
      const { data: res } = await this.$axios.post('/api/example/update', {
        id: this.testForm.id,
        testname: this.testForm.testname,
        module: this.testForm.module,
        function: this.testForm.function,
        creator: this.testForm.creator,
        description: this.testForm.description
      })
      if (!res.success) return this.$message.error(res.errCode)
      this.success('保存用例成功')
      this.$router.push('/example')
    },
    async deleteExample () {
      const { data: res } = await this.$axios.post('/api/example/delete/' + this.testForm.id)
      if (!res.success) return this.error(res.errCode)
      this.success('删除用例成功')
      this.$router.push('/example')
    },
    drawRecord (data) {
      const container = document.getElementById('recordChart')
      container.removeAttribute('_echarts_instance_')
      const recordChart = this.$echarts.init(container)
      const option = {
        tooltip: {
          position: 'top'
        },
        title: [],
        singleAxis: [],
        series: []
      }
      const branchs = {}
      data.forEach(record => {
        if (!(record.branch in branchs)) {
          branchs[record.branch] = { axis: [record.start_time], data: {} }
          branchs[record.branch].data[record.status] = [[record.start_time, record.elapse_time]]
        } else {
          branchs[record.branch].axis.unshift(record.start_time)
          if (branchs[record.branch].data[record.status]) {
            branchs[record.branch].data[record.status].unshift([record.start_time, record.elapse_time])
          } else {
            branchs[record.branch].data[record.status] = [[record.start_time, record.elapse_time]]
          }
        }
      })
      const nAxis = Object.keys(branchs).length
      const height = 30
      const dataNum = data.length
      const colorMap = {
        success: 'rgba(103, 194, 58, 0.8)',
        running: 'rgba(64, 158, 255, 0.8)',
        pending: 'rgba(144, 147, 153, 0.8)',
        error: 'rgba(230, 162, 60, 0.9)',
        failed: 'rgba(245, 108, 108, 0.9)'
      }
      Object.keys(branchs).forEach((b, index) => {
        option.title.push({
          text: b,
          textBaseline: 'middle',
          top: (index + 0.5) * height / nAxis + '%'
        })
        option.singleAxis.push({
          left: 150,
          right: 150,
          type: 'time',
          nameGap: 1,
          boundaryGap: true,
          splitNumber: 1,
          data: branchs[b].axis,
          top: (index * height / nAxis + 5) + '%',
          height: (height / nAxis - 10) + '%',
          axisLabel: { interval: 2 }
        })
        for (const status in branchs[b].data) {
          option.series.push({
            singleAxisIndex: index,
            coordinateSystem: 'singleAxis',
            type: 'scatter',
            data: branchs[b].data[status],
            symbolSize: function (dataItem) {
              return Math.sqrt(dataItem[1] / dataNum) * 5 + 1
            },
            color: colorMap[status]
          })
        }
      })
      recordChart.setOption(option)
      window.onresize = function () { // 自适应大小
        recordChart.resize()
      }
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
