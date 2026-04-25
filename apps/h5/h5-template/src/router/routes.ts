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
    meta: { title: '登录', requiresAuth: false, keepAlive: false, transition: 'slide-fade' }
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页', requiresAuth: true, keepAlive: true, tab: true }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/mine/index.vue'),
    meta: { title: '我的', requiresAuth: true, keepAlive: true, tab: true }
  },
  {
    path: '/theme',
    name: 'Theme',
    component: () => import('@/views/theme/index.vue'),
    meta: { title: '主题', requiresAuth: false, keepAlive: true, tab: true }
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('@/views/list/index.vue'),
    meta: { title: '长列表', requiresAuth: true, keepAlive: true, tab: true }
  },
  {
    path: '/list/detail/:id',
    name: 'ListDetail',
    component: () => import('@/views/list/detail.vue'),
    meta: { title: '条目详情', requiresAuth: true, keepAlive: false }
  },
  {
    path: '/list/create',
    name: 'ListCreate',
    component: () => import('@/views/list/form.vue'),
    meta: { title: '新建条目', requiresAuth: true, keepAlive: false }
  },
  {
    path: '/list/edit/:id',
    name: 'ListEdit',
    component: () => import('@/views/list/form.vue'),
    meta: { title: '编辑条目', requiresAuth: true, keepAlive: false }
  },
  {
    path: '/error/500',
    name: 'Error500',
    component: () => import('@/views/error/500.vue'),
    meta: { title: '服务异常', requiresAuth: false, keepAlive: false }
  },
  {
    path: '/error/network',
    name: 'ErrorNetwork',
    component: () => import('@/views/error/network.vue'),
    meta: { title: '网络异常', requiresAuth: false, keepAlive: false }
  },
  {
    path: '/error/empty',
    name: 'ErrorEmpty',
    component: () => import('@/views/error/empty.vue'),
    meta: { title: '暂无数据', requiresAuth: false, keepAlive: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', requiresAuth: false, keepAlive: false }
  }
]
