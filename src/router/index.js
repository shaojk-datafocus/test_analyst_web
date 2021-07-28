import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Example from '../views/Example.vue'
import ExampleDetail from '../views/ExampleDetail.vue'
import Task from '../views/Task.vue'
import TaskDetail from '../views/TaskDetail.vue'
import Strategy from '../views/Strategy.vue'
import System from '../views/System.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: Dashboard },
  { path: '/example', component: Example, children: [{ path: '/:id', component: ExampleDetail }] },
  { path: '/example/:id', component: ExampleDetail },
  { path: '/task', component: Task },
  { path: '/strategy', component: Strategy },
  { path: '/task/:id', component: TaskDetail },
  { path: '/system', component: System }
  // {
  //   path: '/example', // 子路由
  //   component: Example,
  //   redirect: '/example',
  //   children: [{ path: '/total', component: ExampleTotal }]
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
