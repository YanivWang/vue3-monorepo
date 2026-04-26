import { watch } from 'vue'
import type { App } from 'vue'
import { Locale as VantLocale } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'
import enUS from 'vant/es/locale/lang/en-US'
import type { Composer } from 'vue-i18n'
import {
  createI18nInstance,
  setLocale as _setLocale,
  getLocale as _getLocale,
  BASE_LOCALES,
  type BaseLocale
} from '@vue3-mono/shared/locale'

const PINIA_H5_APP_KEY = 'h5-app'

/** 与 useAppStore 持久化一致：优先读 Pinia 落盘的 language，其次历史 h5:language，再浏览器语言 */
function resolveInitialLocale(): BaseLocale {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(PINIA_H5_APP_KEY)
      if (raw) {
        const data = JSON.parse(raw) as { language?: string }
        const lang = data.language
        if (lang && BASE_LOCALES.includes(lang as BaseLocale)) return lang as BaseLocale
      }
    } catch {
      /* ignore */
    }
    const legacy = localStorage.getItem('h5:language') as BaseLocale | null
    if (legacy && BASE_LOCALES.includes(legacy)) return legacy
  }
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) return 'en-US'
  return 'zh-CN'
}

/** 同步 Vant 内置文案 */
function applyVantLocale(locale: string): void {
  if (locale.startsWith('zh')) VantLocale.use('zh-CN', zhCN)
  else VantLocale.use('en-US', enUS)
}

const initialLocale = resolveInitialLocale()
applyVantLocale(initialLocale)

export const i18n = createI18nInstance({
  locale: initialLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: { login: '登录', logout: '退出', confirm: '确定', cancel: '取消' },
      nav: { home: '首页', list: '长列表', theme: '主题', mine: '我的' },
      theme: { brand: '品牌色', mode: '主题模式', light: '浅色', dark: '深色', system: '跟随系统' }
    },
    'en-US': {
      common: { login: 'Sign in', logout: 'Sign out', confirm: 'OK', cancel: 'Cancel' },
      nav: { home: 'Home', list: 'List', theme: 'Theme', mine: 'Profile' },
      theme: { brand: 'Brand', mode: 'Mode', light: 'Light', dark: 'Dark', system: 'System' }
    }
  }
})

// 监听 i18n 语言变化，同步 Vant Locale（语言持久化由 useAppStore + pinia-plugin-persistedstate 负责）
const composer = i18n.global as unknown as Composer
watch(
  () => composer.locale.value,
  lang => {
    applyVantLocale(String(lang))
  },
  { immediate: false }
)

export function setupI18n(app: App): void {
  app.use(i18n)
}

export function setLocale(locale: BaseLocale): void {
  _setLocale(i18n, locale)
}

export function getLocale(): string {
  return _getLocale(i18n)
}

export { BASE_LOCALES }
export type { BaseLocale }
