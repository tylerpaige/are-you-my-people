import { createRouter, createWebHistory } from 'vue-router';
import QuestionsPage from './pages/QuestionsPage.vue';
import SoundsPage from './pages/SoundsPage.vue';
import FeedPage from './pages/FeedPage.vue';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'questions',
      component: QuestionsPage,
      meta: { title: 'Are You My People? — Questions' },
    },
    {
      path: '/sounds',
      name: 'sounds',
      component: SoundsPage,
      meta: { title: 'Are You My People? — Sounds' },
    },
    {
      path: '/feed',
      name: 'feed',
      component: FeedPage,
      meta: { title: 'Are You My People? — Feed' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title;
  } else {
    document.title = 'Are You My People?';
  }
});

