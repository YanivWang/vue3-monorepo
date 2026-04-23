import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { echarts } from '@/utils/echarts'
import type { EChartsOption } from '@/utils/echarts'
import { useAppStore } from '@/stores/modules/app'

/**
 * ECharts 实例管理 Composable
 * 自动处理：初始化/销毁/resize/暗黑模式联动
 *
 * @example
 * const { chartRef, setOption } = useECharts()
 *
 * onMounted(() => {
 *   setOption({ ... })
 * })
 */
export function useECharts() {
  const chartRef = ref<HTMLElement>()
  let instance: echarts.ECharts | null = null
  const appStore = useAppStore()

  function getTheme() {
    return appStore.isDark ? 'dark' : undefined
  }

  function init() {
    if (!chartRef.value) return
    instance?.dispose()
    instance = echarts.init(chartRef.value, getTheme(), { renderer: 'canvas' })
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

  // 响应式 resize
  let resizeObserver: ResizeObserver | null = null

  onMounted(async () => {
    await nextTick()
    init()

    resizeObserver = new ResizeObserver(() => resize())
    if (chartRef.value) resizeObserver.observe(chartRef.value)
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    dispose()
  })

  // 跟随暗黑模式切换重新初始化
  watch(
    () => appStore.isDark,
    async () => {
      await nextTick()
      if (!chartRef.value) return
      const option = instance?.getOption()
      dispose()
      init()
      if (option) instance?.setOption(option as EChartsOption)
    }
  )

  return { chartRef, setOption, resize, dispose, getInstance: () => instance }
}
