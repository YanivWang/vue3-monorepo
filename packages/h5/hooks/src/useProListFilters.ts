import { ref, type Ref } from 'vue'

/**
 * 与 `ProList` 的 `query` 联动：关键词 + ID 区间筛选（配合底部 `FilterDrawer`）
 */
export function useProListFilters(): {
  keywordInput: Ref<string>
  query: Ref<Record<string, unknown>>
  draftMinId: Ref<string>
  draftMaxId: Ref<string>
  commitSearch: () => void
  clearSearch: () => void
  syncDraftFromQuery: () => void
  commitRange: (minId?: number, maxId?: number) => void
  clearRange: () => void
} {
  const keywordInput = ref('')
  const query = ref<Record<string, unknown>>({})
  const draftMinId = ref('')
  const draftMaxId = ref('')

  function commitSearch() {
    const kw = keywordInput.value.trim()
    query.value = { ...query.value, keyword: kw || undefined }
  }

  function clearSearch() {
    keywordInput.value = ''
    const next = { ...query.value }
    delete next.keyword
    query.value = next
  }

  function syncDraftFromQuery() {
    draftMinId.value = query.value.minId != null ? String(query.value.minId) : ''
    draftMaxId.value = query.value.maxId != null ? String(query.value.maxId) : ''
  }

  function commitRange(minId?: number, maxId?: number) {
    query.value = {
      ...query.value,
      minId,
      maxId
    }
  }

  function clearRange() {
    const next = { ...query.value }
    delete next.minId
    delete next.maxId
    query.value = next
  }

  return {
    keywordInput,
    query,
    draftMinId,
    draftMaxId,
    commitSearch,
    clearSearch,
    syncDraftFromQuery,
    commitRange,
    clearRange
  }
}
