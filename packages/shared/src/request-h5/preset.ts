import { showFailToast, showDialog } from 'vant'
import type { ErrorHookContext, RequestHooks, TokenProvider } from '@vue3-monorepo/request-core'

export interface H5PresetOptions {
  /** 登录页路径，默认 '/login' */
  loginPath?: string
  /** 退出登录回调：用户点击"重新登录"后，跳转前执行（如清理 pinia store） */
  onLogout?: () => void | Promise<void>
  /** 401 Dialog 配置 */
  authDialog?: {
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
  }
  /** 错误提示持续时长 ms（showFailToast.duration） */
  errorDuration?: number
  /**
   * 自定义 401 跳转行为（例如：小程序 WebView 下通知宿主、原生 APP 下调 bridge）
   * 传入后不再使用默认 window.location.href
   */
  redirectLogin?: () => void | Promise<void>
}

/**
 * 创建 H5 端默认 hooks（Vant 绑定）
 * - onError / onBusinessError：showFailToast
 * - onUnauthorized：showDialog → 触发 redirectLogin / location.href
 */
export function createH5Hooks(tokenProvider: TokenProvider, options: H5PresetOptions = {}): RequestHooks {
  const { loginPath = '/login', onLogout, authDialog = {}, errorDuration = 2000, redirectLogin } = options
  const {
    title = '提示',
    message = '登录状态已过期，请重新登录',
    confirmText = '重新登录',
    cancelText = '取消'
  } = authDialog

  let isAuthDialogOpen = false

  const showLoginExpired = async () => {
    if (isAuthDialogOpen) return
    isAuthDialogOpen = true
    try {
      await showDialog({
        title,
        message,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText
      })
      tokenProvider.removeToken()
      tokenProvider.removeRefreshToken()
      await onLogout?.()
      if (redirectLogin) {
        await redirectLogin()
      } else if (typeof window !== 'undefined') {
        window.location.href = loginPath
      }
    } catch {
      /* 用户取消：不做处理 */
    } finally {
      isAuthDialogOpen = false
    }
  }

  const showError = (ctx: ErrorHookContext) => {
    const msg = ctx.error?.message
    if (!msg) return
    showFailToast({ message: msg, duration: errorDuration })
  }

  return {
    onError: showError,
    onBusinessError: showError,
    onUnauthorized: () => {
      void showLoginExpired()
    }
  }
}
