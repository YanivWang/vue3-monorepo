<script setup lang="ts">
import { ref } from 'vue'
import type { PaginationResult } from '@/types/global'
import { useTable } from '@/composables/useTable'

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
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  showSearch: false,
  showAction: false,
  pageSize: 10,
  immediate: true,
  selection: false
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
  fetchData()
  emit('search', params)
}

function handleReset(): void {
  searchParams.value = {}
  pagination.page = 1
  fetchData()
}

/** 暴露给父组件调用 */
defineExpose({ fetchData, handleSearch, handleReset })
</script>

<template>
  <div class="pro-table">
    <!-- 搜索区 -->
    <el-card v-if="showSearch" class="pro-table__search" shadow="never">
      <slot name="search" :handle-search="handleSearch" :handle-reset="handleReset" />
    </el-card>

    <!-- 工具栏 -->
    <el-card class="pro-table__content" shadow="never">
      <div v-if="showAction || $slots.action" class="pro-table__toolbar">
        <div class="pro-table__toolbar-left">
          <slot name="action" />
        </div>
        <div class="pro-table__toolbar-right">
          <el-tooltip content="刷新">
            <el-button :icon="'RefreshRight'" circle plain @click="fetchData()" />
          </el-tooltip>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        :row-key="rowKey"
        border
        stripe
        style="width: 100%"
        @selection-change="(rows: AnyRow[]) => emit('selection-change', rows)"
      >
        <el-table-column v-if="selection" type="selection" width="55" align="center" />

        <template v-for="col in columns" :key="col.prop || col.slot || col.type">
          <!-- 自定义 slot 列 -->
          <el-table-column
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
          </el-table-column>

          <!-- 序号列 -->
          <el-table-column
            v-else-if="col.type === 'index'"
            type="index"
            :label="col.label"
            :width="col.width || 60"
            align="center"
          />

          <!-- 普通数据列 -->
          <el-table-column
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
          <el-empty :description="$t('common.noData')" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pro-table__pagination">
        <el-pagination
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
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
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
