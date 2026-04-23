import { ref, shallowRef, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

export interface UseRequestOptions<T> {
  /** 初始化时立即执行，默认 false */
  immediate?: boolean
  /** 默认数据 */
  initialData?: T
  /** 请求成功回调 */
  onSuccess?: (data: T) => void
  /** 请求失败回调 */
  onError?: (error: Error) => void
  /** 是否显示错误提示，默认 true */
  showError?: boolean
  /**
   * 防抖延迟（ms），适用于搜索联想等场景
   * 设置后将在延迟结束后才真正发送请求
   */
  debounce?: number
}

export interface UseRequestReturn<T, P extends unknown[]> {
  /** 响应数据 */
  data: ReturnType<typeof shallowRef<T | undefined>>
  /** 加载状态 */
  loading: ReturnType<typeof ref<boolean>>
  /** 错误信息 */
  error: ReturnType<typeof ref<Error | null>>
  /** 手动触发请求 */
  run: (...args: P) => Promise<T | undefined>
  /** 取消当前请求 */
  cancel: () => void
  /** 重置状态 */
  reset: () => void
}

/**
 * 异步请求 Composable，封装 loading/error/data 状态
 *
 * @example
 * // 基础用法
 * const { data, loading, run } = useRequest(getUserList)
 * run({ page: 1, pageSize: 10 })
 *
 * @example
 * // 立即执行
 * const { data, loading } = useRequest(() => getUserInfo(), { immediate: true })
 *
 * @example
 * // 搜索防抖
 * const { run } = useRequest(searchUsers, { debounce: 300 })
 * watch(keyword, val => run({ keyword: val }))
 */
export function useRequest<T, P extends unknown[] = unknown[]>(
  requestFn: (...args: P) => Promise<T>,
  options: UseRequestOptions<T> = {}
): UseRequestReturn<T, P> {
  const { immediate = false, initialData, onSuccess, onError, showError = true, debounce: debounceMs = 0 } = options

  const data = shallowRef<T | undefined>(initialData)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let abortController: AbortController | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function cancel() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    loading.value = false
  }

  function reset() {
    cancel()
    data.value = initialData
    error.value = null
  }

  async function execute(...args: P): Promise<T | undefined> {
    cancel()

    abortController = new AbortController()
    loading.value = true
    error.value = null

    try {
      const result = await requestFn(...args)
      data.value = result
      onSuccess?.(result)
      return result
    } catch (err: unknown) {
      // 主动取消不触发错误提示
      if (err instanceof Error && err.name === 'AbortError') return undefined
      if (err instanceof Error && err.name === 'CanceledError') return undefined

      const e = err instanceof Error ? err : new Error(String(err))
      error.value = e
      onError?.(e)
      if (showError) ElMessage.error(e.message || '请求失败')
      return undefined
    } finally {
      loading.value = false
      abortController = null
    }
  }

  function run(...args: P): Promise<T | undefined> {
    if (debounceMs > 0) {
      return new Promise(resolve => {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          execute(...args).then(resolve)
        }, debounceMs)
      })
    }
    return execute(...args)
  }

  // 组件卸载时自动取消进行中的请求
  onUnmounted(cancel)

  if (immediate) {
    run(...([] as unknown as P))
  }

  return { data, loading, error, run, cancel, reset }
}
