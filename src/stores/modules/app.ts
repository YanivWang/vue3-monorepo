import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { lsGet, lsSet } from '@/utils/storage'
import { ThemeMode as ThemeModeEnum, Language, StorageKey } from '@/enums'

type ThemeMode = 'light' | 'dark' | 'system'
type LanguageType = 'zh-CN' | 'en-US'

const SIDEBAR_KEY = StorageKey.SIDEBAR
const THEME_KEY = StorageKey.THEME
const LANG_KEY = StorageKey.LANGUAGE

/**
 * 应用全局状态 Store
 */
export const useAppStore = defineStore('app', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const sidebarCollapsed = ref<boolean>(lsGet<boolean>(SIDEBAR_KEY) ?? false)
  const themeMode = ref<ThemeMode>(lsGet<ThemeMode>(THEME_KEY) ?? ThemeModeEnum.LIGHT)
  const language = ref<LanguageType>(lsGet<LanguageType>(LANG_KEY) ?? Language.ZH_CN)
  const pageLoading = ref<boolean>(false)

  // ── Getters ──────────────────────────────────────────────────────────────
  const isDark = computed(() => themeMode.value === 'dark')
  const isCollapsed = computed(() => sidebarCollapsed.value)

  // ── Actions ──────────────────────────────────────────────────────────────

  /** 切换侧边栏折叠状态 */
  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
    lsSet(SIDEBAR_KEY, sidebarCollapsed.value)
  }

  /** 设置侧边栏折叠 */
  function setSidebarCollapsed(val: boolean): void {
    sidebarCollapsed.value = val
    lsSet(SIDEBAR_KEY, val)
  }

  /** 切换主题 */
  function setTheme(mode: ThemeMode): void {
    themeMode.value = mode
    lsSet(THEME_KEY, mode)

    const html = document.documentElement
    if (mode === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  /** 切换语言（同步更新 vue-i18n locale） */
  function setLanguage(lang: LanguageType): void {
    language.value = lang
    lsSet(LANG_KEY, lang)
    // 延迟导入避免循环依赖（locales 依赖 storage，storage 不依赖 store）
    import('@/locales').then(({ i18n }) => {
      i18n.global.locale.value = lang as typeof i18n.global.locale.value
    })
  }

  /** 设置全局页面加载状态 */
  function setPageLoading(loading: boolean): void {
    pageLoading.value = loading
  }

  return {
    sidebarCollapsed,
    themeMode,
    language,
    pageLoading,
    isDark,
    isCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    setTheme,
    setLanguage,
    setPageLoading
  }
})
