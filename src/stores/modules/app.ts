import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { lsGet, lsSet } from '@/utils/storage'

type ThemeMode = 'light' | 'dark' | 'system'
type LanguageType = 'zh-CN' | 'en-US'

const SIDEBAR_KEY = 'sidebar_collapsed'
const THEME_KEY = 'theme_mode'
const LANG_KEY = 'language'

/**
 * 应用全局状态 Store
 */
export const useAppStore = defineStore('app', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const sidebarCollapsed = ref<boolean>(lsGet<boolean>(SIDEBAR_KEY) ?? false)
  const themeMode = ref<ThemeMode>(lsGet<ThemeMode>(THEME_KEY) ?? 'light')
  const language = ref<LanguageType>(lsGet<LanguageType>(LANG_KEY) ?? 'zh-CN')
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

  /** 切换语言 */
  function setLanguage(lang: LanguageType): void {
    language.value = lang
    lsSet(LANG_KEY, lang)
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
