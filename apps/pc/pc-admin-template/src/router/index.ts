import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

/** 静态白名单路由（无需权限即可访问） */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true,
      requiresAuth: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/register/index.vue'),
    meta: {
      title: '注册',
      hidden: true,
      requiresAuth: false,
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/forgot/index.vue'),
    meta: {
      title: '忘记密码',
      hidden: true,
      requiresAuth: false,
    },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权限',
      hidden: true,
      requiresAuth: true,
    },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/layout/index.vue'),
    redirect: '/home',
    meta: {
      title: '主布局',
      requiresAuth: true,
    },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'HomeFilled',
          keepAlive: true,
          requiresAuth: true,
          permissions: ['dashboard:view'],
        },
      },

      // ── 示例页（开发 / 演示用）────────────────────────────────
      {
        path: 'examples',
        name: 'Examples',
        redirect: '/examples/crud',
        meta: {
          title: '示例',
          icon: 'Grid',
          requiresAuth: true,
        },
        children: [
          {
            path: 'crud',
            name: 'ExampleCrud',
            component: () => import('@/views/examples/crud/index.vue'),
            meta: {
              title: 'CRUD 示例',
              icon: 'List',
              keepAlive: true,
              requiresAuth: true,
            },
          },
          {
            path: 'form',
            name: 'ExampleForm',
            component: () => import('@/views/examples/form/index.vue'),
            meta: {
              title: '表单验证',
              icon: 'Document',
              keepAlive: true,
              requiresAuth: true,
            },
          },
          {
            path: 'upload',
            name: 'ExampleUpload',
            component: () => import('@/views/examples/upload/index.vue'),
            meta: {
              title: '文件上传',
              icon: 'Upload',
              keepAlive: true,
              requiresAuth: true,
            },
          },
          {
            path: 'charts',
            name: 'ExampleCharts',
            component: () => import('@/views/examples/charts/index.vue'),
            meta: {
              title: '图表',
              icon: 'TrendCharts',
              keepAlive: true,
              requiresAuth: true,
            },
          },
        ],
      },
    ],
  },

  // 404 兜底路由，必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404',
      hidden: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  // 切换路由时滚动至顶部
  scrollBehavior: (_to, _from, savedPosition) => {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// 注册路由守卫
setupRouterGuards(router)

/**
 * 重置路由至初始静态路由状态（用于登出清理动态路由）
 */
export function resetRouter(): void {
  const newRouter = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: constantRoutes,
  })
  // 替换 matcher，等效于重置所有动态路由
  ;(router as unknown as { matcher: unknown }).matcher = (newRouter as unknown as { matcher: unknown }).matcher
}

export default router
