import { ElMessage } from 'element-plus'
import { useRequest as useRequestBase, type UseRequestOptions, type UseRequestReturn } from '@vue3-mono/hooks'

/**
 * Admin 封装：默认 onError 走 ElMessage.error
 */
export function useRequest<T, P extends unknown[] = unknown[]>(
  requestFn: (...args: P) => Promise<T>,
  options: UseRequestOptions<T> = {}
): UseRequestReturn<T, P> {
  return useRequestBase<T, P>(requestFn, {
    onError: err => ElMessage.error(err instanceof Error ? err.message : String(err)),
    ...options
  })
}
