import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/storage'
import { useUserStore } from '@/stores/modules/user'

/** 不需要登录即可访问的路由白名单 */
const WHITE_LIST = ['/login', '/register', '/forgot-password']

// NProgress 配置
NProgress.configure({ showSpinner: false })

/**
 * 注册全局路由守卫
 */
export function setupRouterGuards(router: Router): void {
  // ── 全局前置守卫 ──────────────────────────────────────────────────────────
  router.beforeEach(async (to, _from) => {
    NProgress.start()

    const token = getToken()
    const inWhiteList = WHITE_LIST.includes(to.path)

    // 1. 未登录
    if (!token) {
      if (inWhiteList || to.meta.requiresAuth === false) {
        return true
      }
      ElMessage.warning('请先登录')
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // 2. 已登录，访问登录页，直接跳首页
    if (to.path === '/login') {
      return { path: '/' }
    }

    // 3. 已登录，获取用户信息（首次进入时）
    const userStore = useUserStore()
    if (!userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch {
        // 获取用户信息失败（token 失效），清理登录状态并跳转登录页
        userStore.logout()
        return { path: '/login', query: { redirect: to.fullPath } }
      }
    }

    return true
  })

  // ── 全局后置钩子 ──────────────────────────────────────────────────────────
  router.afterEach((to) => {
    // 修改页面标题
    const appTitle = import.meta.env.VITE_APP_TITLE || 'App'
    document.title = to.meta?.title ? `${to.meta.title} - ${appTitle}` : appTitle

    NProgress.done()
  })

  // ── 路由错误处理 ──────────────────────────────────────────────────────────
  router.onError((error) => {
    NProgress.done()
    console.error('路由错误：', error)
  })
}
