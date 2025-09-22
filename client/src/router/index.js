import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Input from '../views/Input.vue'
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