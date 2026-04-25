import { showToast, showSuccessToast, showFailToast, showLoadingToast, showDialog, showNotify, closeToast } from 'vant'
import type { ToastOptions, DialogOptions, NotifyOptions } from 'vant'

export interface UseVantMessageReturn {
  toast(message: string | ToastOptions): void
  success(message: string | ToastOptions): void
  error(message: string | ToastOptions): void
  loading(message: string | ToastOptions): void
  closeToast(): void
  dialog(options: DialogOptions): Promise<'confirm' | 'cancel'>
  confirm(options: DialogOptions): Promise<boolean>
  notify(options: string | NotifyOptions): void
}

/**
 * Vant 消息 API 统一封装（对齐 admin 的 useMessage 体验）
 *
 * - toast / success / error / loading：透传参数
 * - confirm：将 Vant dialog 统一为布尔 Promise（confirm = true / cancel = false）
 * - notify：顶部条状提示
 */
export function useVantMessage(): UseVantMessageReturn {
  function toast(message: string | ToastOptions): void {
    showToast(typeof message === 'string' ? { message, type: 'text' } : message)
  }
  function success(message: string | ToastOptions): void {
    showSuccessToast(typeof message === 'string' ? { message } : message)
  }
  function error(message: string | ToastOptions): void {
    showFailToast(typeof message === 'string' ? { message } : message)
  }
  function loading(message: string | ToastOptions): void {
    showLoadingToast(
      typeof message === 'string' ? { message, forbidClick: true, duration: 0 } : { forbidClick: true, ...message }
    )
  }

  async function dialog(options: DialogOptions): Promise<'confirm' | 'cancel'> {
    try {
      await showDialog(options)
      return 'confirm'
    } catch {
      return 'cancel'
    }
  }

  async function confirm(options: DialogOptions): Promise<boolean> {
    const result = await dialog({ showCancelButton: true, ...options })
    return result === 'confirm'
  }

  function notify(options: string | NotifyOptions): void {
    showNotify(options)
  }

  return {
    toast,
    success,
    error,
    loading,
    closeToast,
    dialog,
    confirm,
    notify
  }
}
