<template>
  <div>
    <h3 style="margin-top: 0">控制台</h3>
    <el-row :gutter="20">
      <el-col :span="6">
        <div id="recordChart1" style="width: 100%; height: 300px"></div>
      </el-col>
      <el-col :span="6">
        <div id="recordChart2" style="width: 100%; height: 300px"></div>
      </el-col>
      <el-col :span="6">
        <div id="recordChart3" style="width: 100%; height: 300px"></div>
      </el-col>
      <el-col :span="6">
        <div id="recordChart4" style="width: 100%; height: 300px"></div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  data () {
    return {
    }
  },
  created () {
    this.getElementStatus()
  },
  mounted () {
  },
  methods: {
    async getElementStatus () {
      const { data: res } = await this.$axios.get('/api/example/report')
      if (!res.success) return this.$message.error(res.errCode)
      console.log(res.data)
      this.drawRecord('recordChart1', res.data)
    },
    drawRecord (canvasId, data) {
      const container = document.getElementById(canvasId)
      container.removeAttribute('_echarts_instance_')
      const chart = this.$echarts.init(container)
      const option = {
        color: [],
        title: {
          text: 'tenantrelease最新测试结果',
          left: 'center',
          textStyle: { fontSize: 12 }
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '用例数量',
            type: 'pie',
            radius: '50%',
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      const lableMap = { success: '成功', failed: '失败', error: '错误', pending: '等待执行', running: '执行中', null: '未执行' }
      const colorMap = { success: '#67C23A', failed: '#f56c6c', error: '#E6A23C', pending: '#909399', running: '#409EFF', null: '#DDDDDD' }
      const label = {}
      data.forEach(item => {
        console.log(item)
        label[item[0]] = item[1]
      })
      console.log(label)
      for (const item of ['running', 'pending', 'success', 'failed', 'error', 'null']) {
        console.log(item)
        option.series[0].data.push({ value: label[item], name: lableMap[item] })
        option.color.push(colorMap[item])
      }
      console.log(option)
      chart.setOption(option)
      window.onresize = function () { // 自适应大小
        chart.resize()
      }
    }
  }
}
</script>

<style scoped></style>
