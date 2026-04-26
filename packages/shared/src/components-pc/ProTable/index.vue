<script setup lang="ts">
import { ref } from 'vue'
import { ElCard, ElTable, ElTableColumn, ElPagination, ElTooltip, ElButton, ElEmpty, vLoading } from 'element-plus'
import type { PaginationResult } from '@vue3-mono/shared/types'
import { useTable } from '@vue3-mono/shared/hooks-core'

type AnyRow = Record<string, unknown>

export interface TableColumn {
  prop?: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: 'left' | 'right' | boolean
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  /** 自定义 slot 名，与 template #slotName 对应 */
  slot?: string
  type?: 'index' | 'selection' | 'expand'
  formatter?: (row: AnyRow, column: TableColumn, value: unknown) => string
}

interface Props {
  /** 数据请求函数 */
  fetchFn: (params: Record<string, unknown>) => Promise<PaginationResult<AnyRow>>
  /** 列配置 */
  columns: TableColumn[]
  /** row-key，默认 id */
  rowKey?: string
  /** 是否显示搜索表单区 */
  showSearch?: boolean
  /** 是否显示操作栏 slot */
  showAction?: boolean
  /** 默认每页条数 */
  pageSize?: number
  /** 是否立即请求 */
  immediate?: boolean
  /** 是否开启多选 */
  selection?: boolean
  /** 空数据文案（默认使用 i18n 的 common.noData，未注入 i18n 时回退此值） */
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  showSearch: false,
  showAction: false,
  pageSize: 10,
  immediate: true,
  selection: false,
  emptyText: '暂无数据'
})

const emit = defineEmits<{
  (e: 'selection-change', rows: AnyRow[]): void
  (e: 'search', params: Record<string, unknown>): void
}>()

const searchParams = ref<Record<string, unknown>>({})

const { loading, tableData, total, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<AnyRow>({
  fetchFn: params => props.fetchFn({ ...params, ...searchParams.value }),
  defaultPageSize: props.pageSize,
  immediate: props.immediate
})

function handleSearch(params: Record<string, unknown>): void {
  searchParams.value = params
  pagination.page = 1
  void fetchData()
  emit('search', params)
}

function handleReset(): void {
  searchParams.value = {}
  pagination.page = 1
  void fetchData()
}

defineExpose({ fetchData, handleSearch, handleReset })
</script>

<template>
  <div class="pro-table">
    <!-- 搜索区 -->
    <ElCard v-if="showSearch" class="pro-table__search" shadow="never">
      <slot name="search" :handle-search="handleSearch" :handle-reset="handleReset" />
    </ElCard>

    <!-- 工具栏 -->
    <ElCard class="pro-table__content" shadow="never">
      <div v-if="showAction || $slots.action" class="pro-table__toolbar">
        <div class="pro-table__toolbar-left">
          <slot name="action" />
        </div>
        <div class="pro-table__toolbar-right">
          <ElTooltip content="刷新">
            <ElButton :icon="'RefreshRight'" circle plain @click="fetchData()" />
          </ElTooltip>
        </div>
      </div>

      <!-- 表格 -->
      <ElTable
        v-loading="loading"
        :data="tableData"
        :row-key="rowKey"
        border
        stripe
        style="width: 100%"
        @selection-change="(rows: AnyRow[]) => emit('selection-change', rows)"
      >
        <ElTableColumn v-if="selection" type="selection" width="55" align="center" />

        <template v-for="col in columns" :key="col.prop || col.slot || col.type">
          <!-- 自定义 slot 列 -->
          <ElTableColumn
            v-if="col.slot"
            :label="col.label"
            :prop="col.prop"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :align="col.align || 'center'"
          >
            <template #default="scope">
              <slot :name="col.slot" :row="scope.row" :index="scope.$index" />
            </template>
          </ElTableColumn>

          <!-- 序号列 -->
          <ElTableColumn
            v-else-if="col.type === 'index'"
            type="index"
            :label="col.label"
            :width="col.width || 60"
            align="center"
          />

          <!-- 普通数据列 -->
          <ElTableColumn
            v-else
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :align="col.align || 'left'"
            :sortable="col.sortable"
            :formatter="col.formatter as never"
            show-overflow-tooltip
          />
        </template>

        <!-- 默认 empty 插槽 -->
        <template #empty>
          <ElEmpty :description="emptyText" />
        </template>
      </ElTable>

      <!-- 分页 -->
      <div class="pro-table__pagination">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
@use '@vue3-mono/shared/styles/tokens/variables' as *;

.pro-table {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  &__search {
    :deep(.el-card__body) {
      padding-bottom: $spacing-sm;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }

  &__toolbar-left {
    display: flex;
    gap: $spacing-sm;
    align-items: center;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: $spacing-md;
  }
}
</style>
