import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import SubjectSelectView from '@/views/SubjectSelectView.vue';
import TopicSelectView from '@/views/TopicSelectView.vue';
import QuizView from '@/views/QuizView.vue';
import ResultView from '@/views/ResultView.vue';
import ComponentPreview from '@/views/ComponentPreview.vue';
import MistakesView from '@/views/MistakesView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { transition: 'fade' }
  },
  {
    path: '/mistakes',
    name: 'mistakes',
    component: MistakesView,
    meta: { transition: 'fade' }
  },
  {
    path: '/subjects',
    name: 'subjects',
    component: SubjectSelectView,
    meta: { transition: 'slide-left' }
  },
  {
    path: '/subjects/:subjectCode/topics',
    name: 'topics',
    component: TopicSelectView,
    props: true,
    meta: { transition: 'slide-left' }
  },
  {
    path: '/subjects/:subjectCode/topics/:topicCode/quiz',
    name: 'quiz',
    component: QuizView,
    props: true,
    meta: { transition: 'slide-left' }
  },
  {
    path: '/subjects/:subjectCode/topics/:topicCode/result',
    name: 'result',
    component: ResultView,
    props: true,
    meta: { transition: 'slide-left' }
  },
  // 以下は今後実装予定のルート
  /*
  {
    path: '/mistakes',
    name: 'mistakes',
    component: () => import('@/views/MistakesView.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { transition: 'slide-left' }
  },
    component: () => import('@/views/ResultView.vue'),
    props: true,
    meta: { transition: 'slide-left' }
  },
  */
  {
    path: '/components',
    name: 'components',
    component: ComponentPreview,
    meta: { transition: 'fade' }
  }
];

const router = createRouter({
  // GitHub Pages環境では '/cat-teacher-quiz/' をベースパスとして使用
  history: createWebHistory(process.env.NODE_ENV === 'production' ? '/cat-teacher-quiz/' : '/'),
  routes
});

export default router;
