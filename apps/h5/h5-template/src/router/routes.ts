import type { RouteRecordRaw } from 'vue-router'

/**
 * H5 路由声明。
 *
 * - `meta.requiresAuth` true 时需登录；未登录将跳转到 /login
 * - `meta.keepAlive` true 时，`<KeepAlive :include>` 基于栈式 history 命中
 * - `meta.tab` true 表示底部 Tab 主入口（如 Home/List/Mine/Theme，供 PageContainer 等区分 replace 进页）
 * - `meta.transition` 自定义切页动画（可选，默认 slide-fade）
 * - `meta.titleKey` 语言文案 key（配合 i18n.t），优先级高于 meta.title
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { titleKey: 'common.login', requiresAuth: false, keepAlive: false, transition: 'slide-fade' },
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { titleKey: 'nav.home', requiresAuth: true, keepAlive: true, tab: true },
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/mine/index.vue'),
    meta: { titleKey: 'nav.mine', requiresAuth: true, keepAlive: true, tab: true },
  },
  {
    path: '/theme',
    name: 'Theme',
    component: () => import('@/views/theme/index.vue'),
    meta: { titleKey: 'nav.theme', requiresAuth: false, keepAlive: true, tab: true },
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('@/views/list/index.vue'),
    meta: { titleKey: 'nav.list', requiresAuth: true, keepAlive: true, tab: true },
  },
  {
    path: '/list/detail/:id',
    name: 'ListDetail',
    component: () => import('@/views/list/detail.vue'),
    meta: { titleKey: 'list.detail', requiresAuth: true, keepAlive: false },
  },
  {
    path: '/list/create',
    name: 'ListCreate',
    component: () => import('@/views/list/form.vue'),
    meta: { titleKey: 'list.create', requiresAuth: true, keepAlive: false },
  },
  {
    path: '/list/edit/:id',
    name: 'ListEdit',
    component: () => import('@/views/list/form.vue'),
    meta: { titleKey: 'list.edit', requiresAuth: true, keepAlive: false },
  },
  {
    path: '/error/500',
    name: 'Error500',
    component: () => import('@/views/error/500.vue'),
    meta: { titleKey: 'error.server', requiresAuth: false, keepAlive: false },
  },
  {
    path: '/error/network',
    name: 'ErrorNetwork',
    component: () => import('@/views/error/network.vue'),
    meta: { titleKey: 'error.network', requiresAuth: false, keepAlive: false },
  },
  {
    path: '/error/empty',
    name: 'ErrorEmpty',
    component: () => import('@/views/error/empty.vue'),
    meta: { titleKey: 'common.noData', requiresAuth: false, keepAlive: false },
  },
  {
    path: '/dev/error-collect',
    name: 'DevErrorCollect',
    component: () => import('@/views/dev/error-collect-test.vue'),
    meta: { title: '错误采集测试', requiresAuth: false, keepAlive: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { titleKey: 'error.notFound', requiresAuth: false, keepAlive: false },
  },
]
