import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Composer } from 'vue-i18n'
import {
  applyBrand,
  applyThemeMode,
  Language,
  ThemeMode as ThemeModeEnum,
  type BrandId,
  type ThemeModeId
} from '@vue3-mono/shared'
import { detectHost } from '@vue3-mono/utils'
import { i18n } from '@/composables/useI18n'

type LanguageType = 'zh-CN' | 'en-US'

/** 管理 system 模式下的媒体查询监听 teardown */
let teardownThemeMode: () => void = () => {}

export const useAppStore = defineStore(
  'h5-app',
  () => {
    const host = ref(detectHost())

    const themeMode = ref<ThemeModeId>(ThemeModeEnum.SYSTEM)
    const brand = ref<BrandId>('blue')
    const language = ref<LanguageType>(Language.ZH_CN)
    const pageLoading = ref(false)

    const isDark = computed(() =>
      themeMode.value === 'dark'
        ? true
        : themeMode.value === 'light'
          ? false
          : typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    )

    function setTheme(mode: ThemeModeId): void {
      themeMode.value = mode
      teardownThemeMode()
      teardownThemeMode = applyThemeMode(mode)
    }

    function setBrand(id: BrandId): void {
      brand.value = id
      applyBrand(id)
    }

    function setLanguage(lang: LanguageType): void {
      language.value = lang
      const composer = i18n.global as unknown as Composer
      composer.locale.value = lang
    }

    function setPageLoading(loading: boolean): void {
      pageLoading.value = loading
    }

    /**
     * 初始化（须在 app.use(pinia) 之后、mount 之前调用）：
     * 根据已持久化状态把主题 / 品牌 / 语言同步到 DOM 与 i18n
     */
    function init(): void {
      setBrand(brand.value)
      setTheme(themeMode.value)
      const composer = i18n.global as unknown as Composer
      composer.locale.value = language.value
    }

    // 宿主变化极少发生，但如业务需要运行时切换，也能持续同步
    watch(host, () => {
      /* 占位：业务可在此触发 bridge 重建 */
    })

    return {
      host,
      themeMode,
      brand,
      language,
      pageLoading,
      isDark,
      setTheme,
      setBrand,
      setLanguage,
      setPageLoading,
      init
    }
  },
  {
    persist: {
      paths: ['themeMode', 'brand', 'language']
    }
  }
)
