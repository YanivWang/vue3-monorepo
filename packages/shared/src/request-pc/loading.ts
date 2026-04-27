import { ElLoading } from 'element-plus'
import type { LoadingHandler } from '@vue3-monorepo/shared/request-core'

/**
 * PC 侧 Loading 处理器：全局单例、计数器叠加，依赖 Element Plus 的 ElLoading。
 */
export function createElLoadingHandler(options: Partial<Parameters<typeof ElLoading.service>[0]> = {}): LoadingHandler {
  let loadingCount = 0
  let loadingInstance: ReturnType<typeof ElLoading.service> | null = null

  const defaults = {
    fullscreen: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.35)'
  }

  return {
    onStart: () => {
      if (loadingCount === 0) {
        loadingInstance = ElLoading.service({ ...defaults, ...options })
      }
      loadingCount++
    },
    onEnd: () => {
      loadingCount = Math.max(0, loadingCount - 1)
      if (loadingCount === 0 && loadingInstance) {
        loadingInstance.close()
        loadingInstance = null
      }
    }
  }
}
