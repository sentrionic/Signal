import { isAuthorized } from '@/stores/userStore';
import { createRouter, createWebHistory, type NavigationGuardNext } from 'vue-router';
import Landing from '../pages/Landing.vue';

const isLoggedIn = (next: NavigationGuardNext) => {
  if (!isAuthorized()) next({ name: 'login' });
  else next();
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/Register.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/Dashboard.vue'),
      beforeEnter: (_, __, next) => isLoggedIn(next),
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../pages/Account.vue'),
      beforeEnter: (_, __, next) => isLoggedIn(next),
    },
  ],
});

export default router;
