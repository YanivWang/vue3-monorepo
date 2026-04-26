import { ref, reactive, type Ref } from 'vue'
import type { PaginationParams, PaginationResult } from '@vue3-mono/shared/types'

export interface UseTableOptions<T, P extends Record<string, unknown> = Record<string, unknown>> {
  /** 数据获取函数 */
  fetchFn: (params: PaginationParams & P) => Promise<PaginationResult<T>>
  /** 是否立即请求，默认 true */
  immediate?: boolean
  /** 默认每页条数，默认 10 */
  defaultPageSize?: number
  /** 额外的默认参数 */
  defaultParams?: Partial<P>
  /** 请求错误回调（UI 无关：显示 toast 由业务层自行负责） */
  onError?: (error: unknown) => void
}

/**
 * 通用表格 Composable：封装分页 / loading / 数据获取逻辑，UI 无关。
 */
export function useTable<T, P extends Record<string, unknown> = Record<string, unknown>>(
  options: UseTableOptions<T, P>
) {
  const { fetchFn, immediate = true, defaultPageSize = 10, defaultParams = {}, onError } = options

  const loading = ref(false)
  const tableData = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const pagination = reactive<PaginationParams>({
    page: 1,
    pageSize: defaultPageSize
  })

  async function fetchData(extraParams?: Partial<P>): Promise<void> {
    loading.value = true
    try {
      const params = {
        ...pagination,
        ...defaultParams,
        ...extraParams
      } as PaginationParams & P
      const result = await fetchFn(params)
      tableData.value = result.list
      total.value = result.total
    } catch (err) {
      onError?.(err)
    } finally {
      loading.value = false
    }
  }

  function handlePageChange(page: number): void {
    pagination.page = page
    void fetchData()
  }
  function handleSizeChange(size: number): void {
    pagination.pageSize = size
    pagination.page = 1
    void fetchData()
  }
  function resetPage(): void {
    pagination.page = 1
  }
  function refresh(): void {
    void fetchData()
  }

  if (immediate) void fetchData()

  return {
    loading,
    tableData,
    total,
    pagination,
    fetchData,
    handlePageChange,
    handleSizeChange,
    resetPage,
    refresh
  }
}
