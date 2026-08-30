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

  function getTheme() {
    return toValue(isDark) ? 'dark' : undefined
  }

  // 返回新实例而不是只赋值：调用方拿返回值继续用，省得 TS 因为「闭包里赋的值看不见」
  // 把 instance 收窄成 never
  function init(): echarts.ECharts | null {
    const el = toValue(target)
    if (!el) return null
    instance?.dispose()
    instance = echarts.init(el, getTheme(), { renderer })
    return instance
  }

  function setOption(option: EChartsOption, notMerge = false) {
    if (!instance) init()
    instance?.setOption(option, { notMerge })
  }

  function resize() {
    instance?.resize()
  }

  function dispose() {
    resizeObserver?.disconnect()
    resizeObserver = null
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
        await nextTick()
        if (!toValue(target)) return
        // 主题只能在 init 时传，所以切换暗黑模式要重建实例并把 option 搬过去
        const option = instance?.getOption()
        instance?.dispose()
        instance = null
        const next = init()
        if (option) next?.setOption(option as EChartsOption)
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
