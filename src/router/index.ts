import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/playground' },
    {
      path: '/playground',
      name: 'playground',
      component: () => import('@/playground/views/PlaygroundView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/examples/login/LoginView.vue'),
    },
    {
      path: '/login-split',
      name: 'login-split',
      component: () => import('@/examples/login/LoginSplitView.vue'),
    },
    {
      path: '/todo',
      name: 'todo',
      component: () => import('@/examples/todo/TodoView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/examples/dashboard/DashboardView.vue'),
    },
  ],
})

export default router
