import { showLoadingToast, closeToast } from 'vant'
import type { LoadingHandler } from '@vue3-monorepo/request-core'

/**
 * H5 侧 Loading 处理器：使用 Vant showLoadingToast + 计数器叠加。
 */
export function createVantLoadingHandler(options: Parameters<typeof showLoadingToast>[0] = {}): LoadingHandler {
  let loadingCount = 0

  const defaults = {
    forbidClick: true,
    message: '加载中...',
    loadingType: 'spinner' as const,
    duration: 0,
  }

  return {
    onStart: () => {
      if (loadingCount === 0) {
        showLoadingToast({ ...defaults, ...(typeof options === 'string' ? {} : options) })
      }
      loadingCount++
    },
    onEnd: () => {
      loadingCount = Math.max(0, loadingCount - 1)
      if (loadingCount === 0) {
        closeToast()
      }
    },
  }
}
