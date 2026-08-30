import { computed } from 'vue'
import {
  useECharts as useEChartsBase,
  type UseEChartsOptions,
  type UseEChartsTarget,
} from '@vue3-monorepo/shared/hooks-pc'
import { useAppStore } from '@/stores/modules/app'

/**
 * Admin 封装：自动从 app store 读取暗黑模式状态，业务层无需重复注入
 *
 * 容器元素由调用方传入（`useTemplateRef` 拿到的 ref 即可），与基础 hook 一致。
 */
export function useECharts(target: UseEChartsTarget, options: Omit<UseEChartsOptions, 'isDark'> = {}) {
  const appStore = useAppStore()
  const isDark = computed(() => appStore.isDark)
  return useEChartsBase(target, { ...options, isDark })
}
