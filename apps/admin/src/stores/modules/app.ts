import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Composer } from 'vue-i18n'
import { ThemeMode as ThemeModeEnum, Language } from '@vue3-mono/shared'
import { i18n } from '@/locales'

type ThemeMode = 'light' | 'dark' | 'system'
type LanguageType = 'zh-CN' | 'en-US'

/** system 模式下的媒体查询监听器引用，切换主题时需先移除旧监听 */
let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null
let systemThemeMQ: MediaQueryList | null = null

/**
 * 应用全局状态 Store
 * persist 配置：sidebar/theme/language 自动持久化到 localStorage
 */
export const useAppStore = defineStore(
  'app',
  () => {
    // ── State ────────────────────────────────────────────────────────────────
    const sidebarCollapsed = ref<boolean>(false)
    const themeMode = ref<ThemeMode>(ThemeModeEnum.LIGHT)
    const language = ref<LanguageType>(Language.ZH_CN)
    const pageLoading = ref<boolean>(false)

    // ── Getters ──────────────────────────────────────────────────────────────
    const isDark = computed(() => themeMode.value === 'dark')
    const isCollapsed = computed(() => sidebarCollapsed.value)

    // ── Actions ──────────────────────────────────────────────────────────────

    /** 切换侧边栏折叠状态 */
    function toggleSidebar(): void {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    /** 设置侧边栏折叠 */
    function setSidebarCollapsed(val: boolean): void {
      sidebarCollapsed.value = val
    }

    /** 移除 system 模式的媒体查询监听器 */
    function _removeSystemListener(): void {
      if (systemThemeMQ && systemThemeListener) {
        systemThemeMQ.removeEventListener('change', systemThemeListener)
        systemThemeListener = null
        systemThemeMQ = null
      }
    }

    /** 切换主题 */
    function setTheme(mode: ThemeMode): void {
      themeMode.value = mode

      // 切换时先清理旧的 system 监听
      _removeSystemListener()

      const html = document.documentElement

      if (mode === 'dark') {
        html.classList.add('dark')
      } else if (mode === 'light') {
        html.classList.remove('dark')
      } else {
        // system：跟随操作系统
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        html.classList.toggle('dark', mq.matches)

        const listener = (e: MediaQueryListEvent) => {
          html.classList.toggle('dark', e.matches)
        }
        mq.addEventListener('change', listener)
        systemThemeMQ = mq
        systemThemeListener = listener
      }
    }

    /** 切换语言（同步更新 vue-i18n locale） */
    function setLanguage(lang: LanguageType): void {
      language.value = lang
      const composer = i18n.global as unknown as Composer
      composer.locale.value = lang
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
  },
  {
    persist: {
      // 只持久化需要跨会话保留的状态（pinia-plugin-persistedstate v3 使用 paths）
      paths: ['sidebarCollapsed', 'themeMode', 'language']
    }
  }
)
