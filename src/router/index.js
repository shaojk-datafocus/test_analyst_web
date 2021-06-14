import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Example from '../views/Example.vue'
import Task from '../views/Task.vue'
import Setting from '../views/Setting.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/example', component: Example },
  { path: '/task', component: Task },
  { path: '/Setting', component: Setting }
  // {
  //   path: '/example', // 子路由
  //   component: Example,
  //   redirect: '/example',
  //   children: [{ path: '/total', component: ExampleTotal }]
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
