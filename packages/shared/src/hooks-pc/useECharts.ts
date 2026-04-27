import { ref, onMounted, onUnmounted, watch, nextTick, type Ref, type ComputedRef } from 'vue'
import * as echarts from 'echarts/core'
import type { EChartsOption } from 'echarts'

export interface UseEChartsOptions {
  /**
   * 是否为 dark 模式：Ref/ComputedRef/Getter。
   * 切换时自动重建图表并保留 option
   */
  isDark?: Ref<boolean> | ComputedRef<boolean> | (() => boolean)
  /** 渲染器，默认 'canvas' */
  renderer?: 'canvas' | 'svg'
}

function unwrapDark(source: Ref<boolean> | ComputedRef<boolean> | (() => boolean) | undefined): boolean {
  if (!source) return false
  if (typeof source === 'function') return (source as () => boolean)()
  return (source as Ref<boolean>).value
}

/**
 * ECharts 实例管理 Composable：
 * 自动处理：初始化 / 销毁 / resize / 暗黑模式联动
 *
 * @remarks
 * - ECharts 组件（LineChart / BarChart 等）需由消费方自行注册；
 *   可直接使用 `@vue3-monorepo/shared/utils` 已预注册的 `echarts`。
 * - 本 hook 不依赖 Element Plus，但随 PC UI 体系一并提供（isDark 通常来自 admin 的 AppStore）。
 */
export function useECharts(options: UseEChartsOptions = {}) {
  const { isDark, renderer = 'canvas' } = options
  const chartRef = ref<HTMLElement>()
  let instance: echarts.ECharts | null = null

  function getTheme() {
    return unwrapDark(isDark) ? 'dark' : undefined
  }

  function init() {
    if (!chartRef.value) return
    instance?.dispose()
    instance = echarts.init(chartRef.value, getTheme(), { renderer })
  }

  function setOption(option: EChartsOption, notMerge = false) {
    if (!instance) init()
    instance?.setOption(option, { notMerge })
  }

  function resize() {
    instance?.resize()
  }
  function dispose() {
    instance?.dispose()
    instance = null
  }

  let resizeObserver: ResizeObserver | null = null

  onMounted(async () => {
    await nextTick()
    if (!instance) init()
    resizeObserver = new ResizeObserver(() => resize())
    if (chartRef.value) resizeObserver.observe(chartRef.value)
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    dispose()
  })

  if (isDark) {
    const source = typeof isDark === 'function' ? isDark : () => (isDark as Ref<boolean>).value
    watch(source, async () => {
      await nextTick()
      if (!chartRef.value) return
      const option = instance?.getOption()
      dispose()
      init()
      if (option) instance?.setOption(option as EChartsOption)
    })
  }

  return {
    chartRef,
    setOption,
    resize,
    dispose,
    getInstance: () => instance
  }
}
