import { ElLoading } from 'element-plus'

let loadingCount = 0
let loadingInstance: ReturnType<typeof ElLoading.service> | null = null

/** 显示全局 Loading，内部计数器+1 */
export function showLoading(): void {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
      fullscreen: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.35)'
    })
  }
  loadingCount++
}

/** 隐藏全局 Loading，内部计数器-1，归零时关闭 */
export function hideLoading(): void {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0 && loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

/** 强制关闭并重置计数器（用于错误兜底） */
export function forceHideLoading(): void {
  loadingCount = 0
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}
