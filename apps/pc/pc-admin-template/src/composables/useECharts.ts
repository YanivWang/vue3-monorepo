import { computed } from 'vue'
import { useECharts as useEChartsBase, type UseEChartsOptions } from '@vue3-mono/shared/hooks-pc'
import { useAppStore } from '@/stores/modules/app'

/**
 * Admin 封装：自动从 app store 读取暗黑模式状态，业务层无需重复注入
 */
export function useECharts(options: Omit<UseEChartsOptions, 'isDark'> = {}) {
  const appStore = useAppStore()
  const isDark = computed(() => appStore.isDark)
  return useEChartsBase({ ...options, isDark })
}
