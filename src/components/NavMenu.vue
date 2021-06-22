<template>
  <el-menu
    :uniqueOpened="true"
    default-active="/dashboard"
    class="el-menu-vertical-demo"
    @select="handleSelect"
    background-color="#ededed"
    text-color="#303133"
    router
  >
    <el-menu-item
      index="/dashboard"
      :class="selectId == '/dashboard' ? 'select' : ''"
    >
      <i class="el-icon-menu"></i>
      <template #title>控制台</template>
    </el-menu-item>
    <el-menu-item
      index="/example"
      :class="selectId == '/example' ? 'select' : ''"
    >
      <i class="el-icon-document"></i>
      <template #title>用例</template>
    </el-menu-item>
    <el-menu-item index="/task" :class="selectId == '/task' ? 'select' : ''">
      <i class="el-icon-odometer"></i>
      <template #title>任务</template>
    </el-menu-item>
    <el-menu-item
      index="/setting"
      :class="selectId == '/setting' ? 'select' : ''"
    >
      <i class="el-icon-setting"></i>
      <template #title>设置</template>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
  data () {
    return {
      selectId: '/dashboard'
    }
  },
  created () {
    this.selectId = '/dashboard'
  },
  methods: {
    handleSelect (index, indexPath) {
      this.selectId = index
    }
  }
}
</script>

<style scoped>
.select {
  border-left: 5px solid #337eed;
}
</style>
