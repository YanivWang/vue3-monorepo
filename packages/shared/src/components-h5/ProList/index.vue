<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref, watch, type Ref } from 'vue'
import { List, PullRefresh, Empty } from 'vant'

export interface ProListPageParams {
  pageNum: number
  pageSize: number
  [k: string]: unknown
}
export interface ProListResult<R> {
  list: R[]
  total: number
}

interface Props {
  /** 数据获取函数；必须返回 { list, total } */
  loader: (params: ProListPageParams) => Promise<ProListResult<T>>
  /** 分页大小，默认 10 */
  pageSize?: number
  /** 是否开启下拉刷新，默认 true */
  pullRefresh?: boolean
  /** 触底提示文案 */
  finishedText?: string
  /** 初始额外查询参数（变化时会自动重置） */
  query?: Record<string, unknown>
  /** 是否初始立即加载（默认 true） */
  immediate?: boolean
  /** 错误展示文案 */
  errorText?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  pullRefresh: true,
  finishedText: '没有更多了',
  query: () => ({}),
  immediate: true,
  errorText: '请求失败，点击重试',
})

const emit = defineEmits<{
  (e: 'loaded', result: { list: T[]; total: number; pageNum: number }): void
  (e: 'error', error: unknown): void
}>()

defineSlots<{
  /** item 行渲染；接收 { item, index } */
  default(props: { item: T; index: number }): void
  empty(): void
}>()

const list = ref<T[]>([]) as Ref<T[]>
const pageNum = ref(1)
const loading = ref(false)
const requestPending = ref(false)
const finished = ref(false)
const error = ref(false)
const refreshing = ref(false)
const total = ref(0)

const isEmpty = computed(() => !loading.value && !refreshing.value && list.value.length === 0 && finished.value)

/**
 * 触底加载：Vant List 在触发 @load 前会先把 v-model:loading 设为 true，
 * 因此不能用 loading 作为「是否正在请求」的判据，否则会直接 return 且走不到 finally，底部会永久「加载中」。
 */
async function load() {
  if (finished.value) {
    loading.value = false
    return
  }
  if (requestPending.value) return
  requestPending.value = true
  loading.value = true
  error.value = false
  try {
    const { list: rows, total: t } = await props.loader({
      pageNum: pageNum.value,
      pageSize: props.pageSize,
      ...props.query,
    })
    const hasValidTotal = typeof t === 'number' && !Number.isNaN(t) && t >= 0
    total.value = hasValidTotal ? t : 0
    if (refreshing.value) {
      list.value = rows
      refreshing.value = false
    } else {
      list.value = [...list.value, ...rows]
    }
    const listLen = list.value.length
    const reachedEnd =
      rows.length === 0 || (hasValidTotal && listLen >= t) || (!hasValidTotal && rows.length < props.pageSize)
    if (reachedEnd) finished.value = true
    emit('loaded', { list: list.value, total: total.value, pageNum: pageNum.value })
    pageNum.value += 1
  } catch (e) {
    error.value = true
    emit('error', e)
  } finally {
    requestPending.value = false
    loading.value = false
  }
}

function reset() {
  list.value = []
  pageNum.value = 1
  finished.value = false
  error.value = false
  total.value = 0
  requestPending.value = false
}

async function refresh() {
  refreshing.value = true
  finished.value = false
  pageNum.value = 1
  error.value = false
  await load()
}

defineExpose({ reset, refresh, load })

watch(
  () => props.query,
  () => {
    reset()
    if (props.immediate) load()
  },
  { deep: true },
)

if (props.immediate) load()
</script>

<template>
  <PullRefresh v-if="props.pullRefresh" v-model="refreshing" :disabled="loading" @refresh="refresh">
    <List
      v-model:loading="loading"
      v-model:error="error"
      :finished="finished"
      :finished-text="props.finishedText"
      :error-text="props.errorText"
      @load="load"
    >
      <template v-for="(item, index) in list" :key="index">
        <slot :item="item" :index="index" />
      </template>
      <template v-if="isEmpty" #finished>
        <slot name="empty"><Empty description="暂无数据" /></slot>
      </template>
    </List>
  </PullRefresh>

  <List
    v-else
    v-model:loading="loading"
    v-model:error="error"
    :finished="finished"
    :finished-text="props.finishedText"
    :error-text="props.errorText"
    @load="load"
  >
    <template v-for="(item, index) in list" :key="index">
      <slot :item="item" :index="index" />
    </template>
    <template v-if="isEmpty" #finished>
      <slot name="empty"><Empty description="暂无数据" /></slot>
    </template>
  </List>
</template>
