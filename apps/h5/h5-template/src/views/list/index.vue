<script setup lang="ts">
import { ref, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Card, Icon, Field, CellGroup, showFailToast, showToast } from 'vant'
import { PageContainer, ProList, FilterDrawer } from '@vue3-monorepo/shared/components-h5'
import type { ProListPageParams } from '@vue3-monorepo/shared/components-h5'
import { useProListFilters } from '@vue3-monorepo/shared/hooks-h5'
import { listApi, type ListItem } from '@/api/list'

defineOptions({ name: 'List' })

const router = useRouter()

const {
  keywordInput,
  query,
  draftMinId,
  draftMaxId,
  commitSearch,
  clearSearch,
  syncDraftFromQuery,
  commitRange,
  clearRange
} = useProListFilters()

const filterOpen = ref(false)

const listRef = ref<{ refresh: () => Promise<void> } | null>(null)

onActivated(() => {
  void listRef.value?.refresh?.()
})

async function loader(params: ProListPageParams) {
  const { pageNum, pageSize, keyword: kw, minId, maxId } = params
  return listApi.fetch({
    pageNum,
    pageSize,
    keyword: (kw as string) || undefined,
    minId: minId != null && minId !== '' ? Number(minId) : undefined,
    maxId: maxId != null && maxId !== '' ? Number(maxId) : undefined
  }) as unknown as {
    list: Array<ListItem & Record<string, unknown>>
    total: number
  }
}

function onSearch() {
  commitSearch()
}

function onClear() {
  clearSearch()
}

function openFilter() {
  syncDraftFromQuery()
  filterOpen.value = true
}

function onFilterConfirm() {
  const minId = draftMinId.value.trim() ? Number(draftMinId.value) : undefined
  const maxId = draftMaxId.value.trim() ? Number(draftMaxId.value) : undefined
  if (draftMinId.value.trim() && Number.isNaN(minId!)) {
    showFailToast('最小 ID 无效')
    return
  }
  if (draftMaxId.value.trim() && Number.isNaN(maxId!)) {
    showFailToast('最大 ID 无效')
    return
  }
  commitRange(
    minId != null && !Number.isNaN(minId) ? minId : undefined,
    maxId != null && !Number.isNaN(maxId) ? maxId : undefined
  )
  filterOpen.value = false
}

function onFilterReset() {
  draftMinId.value = ''
  draftMaxId.value = ''
  clearRange()
}

function goDetail(item: ListItem) {
  router.push({ name: 'ListDetail', params: { id: String(item.id) } })
}

function goCreate() {
  router.push({ name: 'ListCreate' })
}
</script>

<template>
  <PageContainer title="长列表" fill>
    <template #right>
      <span class="list-nav-actions" @click="goCreate">
        <Icon name="plus" size="20" />
        <span class="list-nav-actions__text">新建</span>
      </span>
    </template>

    <div class="list-page">
      <div class="list-toolbar">
        <Search
          v-model="keywordInput"
          shape="round"
          placeholder="关键词（标题 / 摘要 / ID）"
          @search="onSearch"
          @clear="onClear"
        />
        <button type="button" class="list-filter-btn" @click="openFilter">
          <Icon name="filter-o" />
          筛选
        </button>
      </div>

      <ProList ref="listRef" :loader="loader" :query="query" :page-size="10">
        <template #default="{ item }: { item: ListItem; index: number }">
          <Card
            v-longpress="() => showToast(`长按 #${item.id}`)"
            clickable
            :title="item.title"
            :desc="item.summary"
            :thumb="item.cover"
            class="list-card"
            @click="goDetail(item)"
          >
            <template #footer>
              <span class="list-card__meta">#{{ item.id }} · {{ new Date(item.createdAt).toLocaleDateString() }}</span>
            </template>
          </Card>
        </template>
      </ProList>

      <FilterDrawer
        v-model:show="filterOpen"
        title="筛选条件"
        cancel-text="重置"
        @confirm="onFilterConfirm"
        @reset="onFilterReset"
      >
        <CellGroup inset>
          <Field v-model="draftMinId" label="最小 ID" type="digit" placeholder="可选" />
          <Field v-model="draftMaxId" label="最大 ID" type="digit" placeholder="可选" />
        </CellGroup>
      </FilterDrawer>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.list-nav-actions {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 0 12px;
  font-size: 14px;
  color: var(--color-primary);
}

.list-nav-actions__text {
  line-height: 1;
}

.list-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 8px 0;

  :deep(.van-search) {
    flex: 1;
    padding: 0;
  }
}

.list-filter-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 0 12px;
  font-size: 14px;
  color: var(--color-primary);
  white-space: nowrap;
  background: transparent;
  border: none;
}

.list-page {
  padding-bottom: 24px;
}

.list-card {
  margin: 8px 12px;
}

.list-card__meta {
  font-size: 12px;
  color: var(--text-placeholder);
}
</style>
