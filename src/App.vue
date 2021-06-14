<template>
  <el-container class="app-container">
    <!-- 头部 -->
    <el-header>
      <img src="../src/assets/focus.svg" style="height: 35px" />
      <span>测试用例可视化操作系统</span>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="120px">
        <NavMenu></NavMenu>
      </el-aside>
      <!-- 页面内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import NavMenu from './components/NavMenu.vue'
export default {
  name: 'app',
  components: { NavMenu }
}
</script>

<style>
html {
  height: 100%;
}

body {
  margin: 0;
  height: 100%;
}

#app {
  height: 100%;
}

.app-container {
  height: 100%;
}

.el-header {
  background-color: #337eed;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 !important;
  height: 40px !important;
  font-size: 14px;
}

.el-aside {
  background-color: #ededed;
}

.el-main {
  background-color: white;
}
</style>
