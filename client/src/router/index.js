import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Input from '../views/Input.vue'
import Output from '../views/Output.vue'
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index,
  },
  {
    path: '/room/:roomId/input',
    name: 'Input',
    component: Input,
    props: true,
  },
  {
    path: '/room/:roomId/output',
    name: 'Output',
    component: Output,
    props: true,
  },
  {
    path: '/room/:roomId',
    name: 'dashboard',
    component: Dashboard,
    props: true,
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
