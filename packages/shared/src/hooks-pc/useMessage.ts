import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import type { MessageOptions, ElMessageBoxOptions } from 'element-plus'

type NotifyOptions = {
  title: string
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
  duration?: number
}

/**
 * 全局弹窗/通知 Composable（Element Plus 绑定）
 *
 * 统一封装 ElMessage / ElMessageBox / ElNotification，提供语义化快捷方法
 *
 * @example
 * const { success, confirm, notify } = useMessage()
 * success('操作成功')
 * await confirm('确认删除该用户？')
 */
export function useMessage() {
  function success(message: string, options?: Partial<MessageOptions>) {
    ElMessage.success({ message, duration: 2000, ...options })
  }
  function error(message: string, options?: Partial<MessageOptions>) {
    ElMessage.error({ message, duration: 3000, ...options })
  }
  function warning(message: string, options?: Partial<MessageOptions>) {
    ElMessage.warning({ message, duration: 2500, ...options })
  }
  function info(message: string, options?: Partial<MessageOptions>) {
    ElMessage.info({ message, duration: 2000, ...options })
  }

  /**
   * 操作确认弹框，返回 Promise
   * resolve → 点击确认；reject → 点击取消/关闭
   */
  async function confirm(message: string, options?: Partial<ElMessageBoxOptions>): Promise<void> {
    await ElMessageBox.confirm(message, options?.title ?? '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      ...options,
    })
  }

  /** 危险操作二次确认（按钮样式为红色） */
  async function confirmDelete(
    message = '此操作不可撤销，确认继续？',
    options?: Partial<ElMessageBoxOptions>,
  ): Promise<void> {
    await ElMessageBox.confirm(message, options?.title ?? '危险操作', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'error',
      confirmButtonClass: 'el-button--danger',
      ...options,
    })
  }

  /** 输入对话框，返回输入值 */
  async function prompt(message: string, title = '请输入', options?: Partial<ElMessageBoxOptions>): Promise<string> {
    const { value } = await ElMessageBox.prompt(message, title, {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      ...options,
    })
    return value
  }

  function notify({ title, message, type = 'info', duration = 3000 }: NotifyOptions) {
    ElNotification({ title, message, type, duration })
  }

  return {
    success,
    error,
    warning,
    info,
    confirm,
    confirmDelete,
    prompt,
    notify,
  }
}
