import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import installElementPlus from './plugins/element'
import axios from 'axios'
import * as echarts from 'echarts'

const app = createApp(App)
installElementPlus(app)
app.config.globalProperties.$axios = axios
app.config.globalProperties.$echarts = echarts
app.use(router).mount('#app')
