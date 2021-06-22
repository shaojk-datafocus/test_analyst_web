<template>
  <div>
    <!-- 面板屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/example' }">用例</el-breadcrumb-item>
      <el-breadcrumb-item>{{ testForm.testname }}</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 用例信息 -->
    <el-row :gutter="20">
        <el-col :span="12">
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
        <el-col :span="8">
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
      dynamicTags: ['标签一', '标签二', '标签三'],
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
    this.getExampleDetail(this.$route.params.id)
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
      const { data: res } = await this.$axios.get('/example/' + id)
      if (!res.success) return this.$message.error(res.errCode)
      this.testForm = res.data
      this.editable = true
      console.log(this.testForm)
    },
    async saveExample () {
      console.log(this.$refs)
      const { data: res } = await this.$axios.post('/example/update', {
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
      const { data: res } = await this.$axios.post('/example/delete/' + this.testForm.id)
      if (!res.success) return this.error(res.errCode)
      this.success('删除用例成功')
      this.$router.push('/example')
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
