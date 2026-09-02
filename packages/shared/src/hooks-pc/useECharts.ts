import { onUnmounted, watch, nextTick, toValue, type MaybeRefOrGetter } from 'vue'
import * as echarts from 'echarts/core'
import type { EChartsOption } from 'echarts'

export interface UseEChartsOptions {
  /**
   * 是否为 dark 模式：Ref/ComputedRef/Getter。
   * 切换时自动重建图表并保留 option
   */
  isDark?: MaybeRefOrGetter<boolean>
  /** 渲染器，默认 'canvas' */
  renderer?: 'canvas' | 'svg'
}

/** 容器元素：ref / getter / 裸元素都可以，与 VueUse 的入参约定一致 */
export type UseEChartsTarget = MaybeRefOrGetter<HTMLElement | null | undefined>

/**
 * ECharts 实例管理 Composable：自动处理初始化 / 销毁 / resize / 暗黑模式联动。
 *
 * 容器元素**由调用方传入**，而不是由本 hook 造一个 ref 让调用方去挂：
 * 后者要靠 `ref="chartRef"` 这种「按变量名隐式绑定」的写法，Vue 3.5 起已改推
 * `useTemplateRef()`，且在 vue-tsc 3 下那个变量不再被算作「被使用」，
 * 开着 `noUnusedLocals` 会直接报错。传入式也是 VueUse 全系的约定。
 *
 * ```vue
 * <script setup lang="ts">
 * const el = useTemplateRef<HTMLElement>('chart')
 * const { setOption } = useECharts(el, { isDark })
 * </script>
 *
 * <template><div ref="chart" /></template>
 * ```
 *
 * @remarks
 * - ECharts 组件（LineChart / BarChart 等）需由消费方自行注册；
 *   可直接使用 `@vue3-monorepo/shared/utils` 已预注册的 `echarts`。
 * - 本 hook 不依赖 Element Plus，但随 PC UI 体系一并提供（isDark 通常来自 admin 的 AppStore）。
 */
export function useECharts(target: UseEChartsTarget, options: UseEChartsOptions = {}) {
  const { isDark, renderer = 'canvas' } = options
  let instance: echarts.ECharts | null = null
  let resizeObserver: ResizeObserver | null = null

  /**
   * 最近一次 option。实例会在三处被拆掉重建——容器出现/更换/重新挂载、暗黑模式切换、
   * 调用方手动 dispose——不记着它，这三种情况下图表都会变空白。
   *
   * 它同时兜住另一半：容器还没出现时调用 setOption（在 `onMounted` 里直接调、或容器
   * 挂在 v-if 后面）此刻没有实例可写，先记在这里，等 init() 时重放。
   *
   * 实例活着的时候不往这里同步——ECharts 自己就是真源，每次 setOption 都
   * getOption() 一遍要深拷贝整份内部状态，频繁刷新的图表上是白付的开销。
   * 只在拆实例前 captureOption() 快照一次即可。
   */
  let lastOption: EChartsOption | null = null

  function getTheme() {
    return toValue(isDark) ? 'dark' : undefined
  }

  /** 拆实例前把内容快照下来：getOption() 拿到的是 ECharts 合并后的完整状态 */
  function captureOption() {
    if (instance) lastOption = instance.getOption() as EChartsOption
  }

  // 返回新实例而不是只赋值：调用方拿返回值继续用，省得 TS 因为「闭包里赋的值看不见」
  // 把 instance 收窄成 never
  function init(): echarts.ECharts | null {
    const el = toValue(target)
    if (!el) return null
    captureOption()
    instance?.dispose()
    instance = echarts.init(el, getTheme(), { renderer })
    // 重放用 notMerge：lastOption 要么是上一个实例的完整快照，要么是容器就位前挂起的
    // 那次调用，两种都该整份铺上去，而不是往空实例上做增量合并
    if (lastOption) instance.setOption(lastOption, { notMerge: true })
    return instance
  }

  function setOption(option: EChartsOption, notMerge = false) {
    if (!instance) init()
    if (instance) {
      instance.setOption(option, { notMerge })
      return
    }
    // 容器仍未出现：挂起，等容器 watch 建实例时由 init() 重放。
    // 直接丢掉的话调用方没有任何提示，只看到图表一直空白。
    lastOption = notMerge || !lastOption ? option : { ...lastOption, ...option }
  }

  function resize() {
    instance?.resize()
  }

  function dispose() {
    resizeObserver?.disconnect()
    resizeObserver = null
    captureOption()
    instance?.dispose()
    instance = null
  }

  // 监听容器本身：v-if / 异步渲染下元素可能晚于 setup 出现，也可能中途被卸载。
  // immediate 让「元素已经在」的场景不必等下一次变更。
  watch(
    () => toValue(target),
    (el) => {
      dispose()
      if (!el) return
      init()
      resizeObserver = new ResizeObserver(() => resize())
      resizeObserver.observe(el)
    },
    { immediate: true, flush: 'post' },
  )

  if (isDark) {
    watch(
      () => toValue(isDark),
      async () => {
        // 主题只能在 init 时传，所以切换暗黑模式要整个重建实例。
        // option 的搬运由 init() 负责（captureOption → 重建 → 重放），这里不再自己搬：
        // 两处各写一套的时候，容器那条路径上就漏掉了，图表切完主题会变空白。
        await nextTick()
        init()
      },
    )
  }

  onUnmounted(dispose)

  return {
    setOption,
    resize,
    dispose,
    getInstance: () => instance,
  }
}
