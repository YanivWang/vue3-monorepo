import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface UsePaginationOptions {
  /** 初始页码，默认 1 */
  initialPage?: number
  /** 每页条数，默认 10 */
  initialPageSize?: number
}

export interface UsePaginationReturn {
  pageNum: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  /** 总页数（total=0 时为 0） */
  totalPages: ComputedRef<number>
  /** 是否有上一页 */
  hasPrev: ComputedRef<boolean>
  /** 是否有下一页 */
  hasNext: ComputedRef<boolean>
  setPage: (n: number) => void
  setPageSize: (n: number) => void
  setTotal: (n: number) => void
  next: () => void
  prev: () => void
  reset: () => void
}

/**
 * 通用分页状态（仅逻辑，表格/列表自行绑定请求）
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = 1, initialPageSize = 10 } = options
  const pageNum = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)

  const totalPages = computed(() => {
    if (total.value <= 0) return 0
    return Math.ceil(total.value / pageSize.value)
  })

  const hasPrev = computed(() => pageNum.value > 1)
  const hasNext = computed(() => totalPages.value > 0 && pageNum.value < totalPages.value)

  function setPage(n: number) {
    const next = Math.max(1, Math.floor(n))
    pageNum.value = totalPages.value > 0 ? Math.min(next, totalPages.value) : next
  }

  function setPageSize(n: number) {
    pageSize.value = Math.max(1, Math.floor(n))
    setPage(1)
  }

  function setTotal(n: number) {
    total.value = Math.max(0, Math.floor(n))
    if (pageNum.value > totalPages.value && totalPages.value > 0) {
      pageNum.value = totalPages.value
    }
  }

  function next() {
    if (hasNext.value) pageNum.value += 1
  }

  function prev() {
    if (hasPrev.value) pageNum.value -= 1
  }

  function reset() {
    pageNum.value = initialPage
    pageSize.value = initialPageSize
    total.value = 0
  }

  return {
    pageNum,
    pageSize,
    total,
    totalPages,
    hasPrev,
    hasNext,
    setPage,
    setPageSize,
    setTotal,
    next,
    prev,
    reset,
  }
}
