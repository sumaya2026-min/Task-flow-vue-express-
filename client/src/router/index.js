import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '../pages/AuthPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/auth', component: AuthPage },
    { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } }
  ]
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.token) {
    return '/auth';
  }
  if (to.path === '/auth' && authStore.token) {
    return '/dashboard';
  }
});

export default router;
