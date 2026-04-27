import { ElMessage } from 'element-plus'
import { useTable as useTableBase, type UseTableOptions } from '@vue3-monorepo/shared/hooks-core'

/**
 * Admin 封装：默认 onError 走 ElMessage.error
 */
export function useTable<T = Record<string, unknown>>(options: UseTableOptions<T>): ReturnType<typeof useTableBase<T>> {
  return useTableBase<T>({
    onError: err => ElMessage.error(err instanceof Error ? err.message : String(err)),
    ...options
  })
}
