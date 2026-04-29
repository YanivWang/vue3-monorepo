import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Composer } from 'vue-i18n'
import { Language, ThemeMode as ThemeModeEnum } from '@vue3-monorepo/shared/enums'
import {
  applyBrand,
  applyThemeMode,
  getAppliedThemeMode,
  type BrandId,
  type ThemeModeId
} from '@vue3-monorepo/shared/styles/tokens'
import { detectHost } from '@vue3-monorepo/shared/utils'
import { i18n, ensureH5LocaleReady } from '@/composables/useI18n'

type LanguageType = 'zh-CN' | 'en-US'

/** `applyThemeMode` 返回的清理函数；切换主题前先调用，避免重复注册 matchMedia */
let teardownThemeMode: () => void = () => {}
/**
 * `themeMode === 'system'` 时：单独监听 `prefers-color-scheme`，`themeTick++` 触发 `isDark` 等计算属性
 *（`applyThemeMode` 已负责改 `html.dark`，此处只补 Vue 响应式刷新）
 */
let teardownSystemDarkSync: () => void = () => {}

export const useAppStore = defineStore(
  'h5-app',
  () => {
    const host = ref(detectHost())

    const themeMode = ref<ThemeModeId>(ThemeModeEnum.SYSTEM)
    const brand = ref<BrandId>('blue')
    const language = ref<LanguageType>(Language.ZH_CN)
    const pageLoading = ref(false)

    const themeTick = ref(0)

    /** light / dark 看 `themeMode`；system 看当前 DOM（`getAppliedThemeMode`），并依赖 `themeTick` 在系统配色变化时重算 */
    const isDark = computed(() => {
      void themeTick.value
      if (themeMode.value === 'dark') return true
      if (themeMode.value === 'light') return false
      return getAppliedThemeMode() === 'dark'
    })

    /** 同步 `themeMode`、调用 `applyThemeMode` 写 DOM；system 下额外注册 `themeTick` 监听 */
    function setTheme(mode: ThemeModeId): void {
      teardownSystemDarkSync()
      themeMode.value = mode
      teardownThemeMode()
      teardownThemeMode = applyThemeMode(mode)
      themeTick.value++
      if (mode === 'system' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        const mql = window.matchMedia('(prefers-color-scheme: dark)')
        const onSchemeChange = () => {
          themeTick.value++
        }
        mql.addEventListener('change', onSchemeChange)
        teardownSystemDarkSync = () => mql.removeEventListener('change', onSchemeChange)
      } else {
        teardownSystemDarkSync = () => {}
      }
    }

    /** 更新 `brand` 并 `applyBrand` 写 `html[data-brand]` */
    function setBrand(id: BrandId): void {
      brand.value = id
      applyBrand(id)
    }

    async function setLanguage(lang: LanguageType): Promise<void> {
      language.value = lang
      await ensureH5LocaleReady(lang)
      const composer = i18n.global as unknown as Composer
      composer.locale.value = lang
    }

    function setPageLoading(loading: boolean): void {
      pageLoading.value = loading
    }

    /**
     * 将已持久化的 `brand` / `themeMode` / `language` 同步到 DOM（`data-brand`、`html.dark`）与 i18n
     * 须在 `app.use(pinia)` 之后调用（当前在 `main.ts` 里于 `mount` 之前执行）
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
