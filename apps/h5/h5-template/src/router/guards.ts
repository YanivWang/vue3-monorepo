import type { Router } from 'vue-router'
import { useBridge } from '@vue3-mono/bridge'
import { H5Host } from '@vue3-mono/shared'
import { useHistoryStackH5 } from '@vue3-mono/hooks-h5'
import { getToken } from '@/utils/tokenStorage'
import { i18n } from '@/composables/useI18n'

/**
 * H5 路由守卫：
 * 1. 栈式 keep-alive 入/出栈（依赖 @vue3-mono/hooks-h5）
 * 2. requiresAuth 校验 token；缺失时按宿主不同走差异化登录入口：
 *      - browser  → 跳转 /login
 *      - wx-mini  → 拉起小程序登录页（通过 bridge.navigation.openExternal）
 *      - ali-mini → 同上
 *      - native-app → 调 bridge.auth.login 让原生处理
 * 3. 动态设置 document.title / native setTitle（通过 bridge）
 */
export function setupRouterGuards(router: Router): void {
  const bridge = useBridge()

  /** 鉴权先于栈更新，避免未授权目标页错误入栈（Vue Router 在 redirect 时会中止后续守卫） */
  router.beforeEach(async to => {
    const requiresAuth = Boolean(to.meta?.requiresAuth)
    const token = getToken()

    if (requiresAuth && !token) {
      switch (bridge.host) {
        case H5Host.WECHAT_MINI:
        case H5Host.ALIPAY_MINI:
          try {
            await bridge.auth.login()
            return true
          } catch {
            return false
          }
        case H5Host.NATIVE_APP:
          try {
            await bridge.auth.login()
            return true
          } catch {
            return { name: 'Login', query: { redirect: to.fullPath } }
          }
        case H5Host.BROWSER:
        default:
          return { name: 'Login', query: { redirect: to.fullPath } }
      }
    }

    // 已登录用户访问 /login → 重定向回首页
    if (to.name === 'Login' && token) {
      return { name: 'Home' }
    }
    return true
  })

  const stack = useHistoryStackH5({ autoBind: false })
  stack.bind(router)

  router.afterEach(to => {
    const titleKey = to.meta?.titleKey as string | undefined
    const title = titleKey
      ? (i18n.global as { t: (k: string) => string }).t(titleKey)
      : ((to.meta?.title as string) ?? '')
    if (title && typeof document !== 'undefined') document.title = title
    if (title) bridge.navigation.setTitle(title).catch(() => {})
  })
}
