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
      <el-tooltip class="item" effect="dark" content="控制台" placement="right">
        <i class="el-icon-menu"></i>
      </el-tooltip>
    </el-menu-item>
    <el-menu-item
      index="/example"
      :class="selectId == '/example' ? 'select' : ''"
    >
      <el-tooltip class="item" effect="dark" content="用例" placement="right">
        <i class="el-icon-document"></i>
      </el-tooltip>
    </el-menu-item>
    <el-menu-item index="/task" :class="selectId == '/task' ? 'select' : ''">
      <el-tooltip class="item" effect="dark" content="任务" placement="right">
        <i class="el-icon-odometer"></i>
      </el-tooltip>
    </el-menu-item>
    <el-menu-item
      index="/system"
      :class="selectId == '/system' ? 'select' : ''"
    >
      <el-tooltip class="item" effect="dark" content="系统" placement="right">
        <i class="el-icon-setting"></i>
      </el-tooltip>
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
  position: relative;
}
.select::after{
  position: absolute;
  height: 100%;
  width: 10px;
  left: -4px;
  background-color: #337eed;
  content: " ";
  border-radius: 0 50% 50% 0;
}
.icon {
  width: 30px;
  height: 30px;
}
</style>
