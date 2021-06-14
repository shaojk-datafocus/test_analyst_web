<template>
  <!-- 面板屑 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/example' }">任务</el-breadcrumb-item>
    <el-breadcrumb-item>活动管理</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 查询框 -->
  <el-row gutter="10">
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
      <el-button type="primary">新增任务</el-button>
    </el-col>
  </el-row>
  <!-- 用例内容表格展示 -->
  <el-table
    :data="tableData"
    tooltip-effect="dark"
    style="width: 100%"
    @selection-change="handleSelectionChange"
    size="mini"
  >
    <el-table-column type="selection" width="36"> </el-table-column>
    <el-table-column prop="name" label="名称"></el-table-column>
    <el-table-column prop="description" label="描述"></el-table-column>
    <el-table-column prop="author" label="编写人"></el-table-column>
    <!-- <el-table-column prop="tag" label="标签">
      <template #default="scope">
        <div v-for="(item,key) in scope.row.tag.split(',')" :key="key">
          <el-tag type="success">{{ item }}</el-tag>
        </div>
      </template>
    </el-table-column> -->
    <el-table-column prop="status" label="状态">
      <template #default="scope">
        <i
          :class="'status el-icon-' + (scope.row.status ? 'success' : 'error')"
        ></i>
      </template>
    </el-table-column>
    <el-table-column prop="execute_time" label="执行时间"></el-table-column>
    <el-table-column prop="time" label="耗时"></el-table-column>
    <el-table-column prop="operate" label="操作" width="150">
      <template #default="scope">
        <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
          >编辑</el-button
        >
        <el-button
          size="mini"
          type="danger"
          @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button
        >
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页 -->
  <div class="block">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-size="100"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>
<script>
export default {
  data () {
    return {
      search: '',
      currentPage: 1,
      total: 256,
      tableData: [
        {
          name: 'hlt.v5.api.testCollection',
          address: '测试api综合功能',
          author: '邵俊凯',
          status: true,
          execute_time: '2021-06-03 12:32:12',
          time: '3min 5s',
          tag: 'API,接口级'
        },
        {
          name: 'hlt.v5.api.testCollection.testCreateUser',
          address: '测试api基础功能',
          author: '汪荣涛',
          status: false,
          execute_time: '2021-06-03 12:32:12',
          time: '3min 5s',
          tag: ''
        }
      ]
    }
  },
  methods: {
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`)
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
