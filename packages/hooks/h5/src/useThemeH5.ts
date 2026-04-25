import { watch } from 'vue'
import { Locale as VantLocale } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'
import enUS from 'vant/es/locale/lang/en-US'
import { createUseTheme, type ThemeStorage, type UseThemeReturn } from '@vue3-mono/hooks'
import type { BrandId, ThemeModeId } from '@vue3-mono/shared'

export interface UseThemeH5Options {
  storage: ThemeStorage
  defaultBrand?: BrandId
  defaultMode?: ThemeModeId
  storageKeyPrefix?: string
  /** 自动订阅语言 ref（可选），实现 Vant Locale 联动 */
  locale?: { value: string }
}

/**
 * H5 端主题 composable 工厂。
 *
 * - 内部复用通用 createUseTheme
 * - 若提供 locale，watch 其变化并调用 VantLocale.use 同步 Vant 内建文案
 */
export function createUseThemeH5(options: UseThemeH5Options): () => UseThemeReturn {
  const baseUse = createUseTheme({
    storage: options.storage,
    defaultBrand: options.defaultBrand,
    defaultMode: options.defaultMode,
    storageKeyPrefix: options.storageKeyPrefix
  })

  return function useThemeH5(): UseThemeReturn {
    const ctx = baseUse()
    if (options.locale) {
      watch(
        () => options.locale!.value,
        lang => {
          if (lang?.startsWith('zh')) VantLocale.use('zh-CN', zhCN)
          else VantLocale.use('en-US', enUS)
        },
        { immediate: true }
      )
    }
    return ctx
  }
}
