import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/storage'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'
import { useTabsStore } from '@/stores/modules/tabs'

/** 不需要登录即可访问的路由白名单 */
const WHITE_LIST = ['/login', '/register', '/forgot-password']

NProgress.configure({ showSpinner: false })

export function setupRouterGuards(router: Router): void {
  // ── 全局前置守卫 ──────────────────────────────────────────────────────────
  router.beforeEach(async (to, _from) => {
    NProgress.start()

    const token = getToken()
    const inWhiteList = WHITE_LIST.includes(to.path)

    // 1. 未登录
    if (!token) {
      if (inWhiteList || to.meta.requiresAuth === false) return true
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // 2. 已登录访问登录页 → 去首页
    if (to.path === '/login') return { path: '/' }

    // 3. 已登录，确保用户信息已加载
    const userStore = useUserStore()
    if (!userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch {
        userStore.logout()
        return { path: '/login', query: { redirect: to.fullPath } }
      }
    }

    // 4. 动态路由尚未加载 → 生成并注册，然后重定向触发新路由匹配
    const permissionStore = usePermissionStore()
    if (!permissionStore.isRoutesLoaded) {
      try {
        const dynamicRoutes = await permissionStore.generateRoutes()
        // 将动态路由挂到 Layout 子路由下
        dynamicRoutes.forEach((route) => {
          router.addRoute('Layout', route)
        })
        // 重定向以匹配刚注册的新路由
        return { ...to, replace: true }
      } catch {
        userStore.logout()
        return { path: '/login', query: { redirect: to.fullPath } }
      }
    }

    // 5. 权限校验（路由级）
    const required = to.matched.flatMap((r) => r.meta?.permissions ?? []).filter((p): p is string => Boolean(p))

    if (required.length > 0) {
      const allowed = required.some((p) => userStore.hasPermission(p))
      if (!allowed) return { path: '/403' }
    }

    return true
  })

  // ── 全局后置钩子 ──────────────────────────────────────────────────────────
  router.afterEach((to) => {
    const appTitle = import.meta.env.VITE_APP_TITLE || 'vue3-monorepo'
    document.title = to.meta?.title ? `${to.meta.title} - ${appTitle}` : appTitle

    // 同步 tab 状态
    const tabsStore = useTabsStore()
    tabsStore.addTab(to)

    NProgress.done()
  })

  // ── 路由错误处理 ──────────────────────────────────────────────────────────
  router.onError((error) => {
    NProgress.done()
    console.error('路由错误：', error)
  })
}
