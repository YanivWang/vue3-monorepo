import type { App } from 'vue'
import {
  createI18nLazyShell,
  mergeSharedLocaleMessage,
  preloadSharedLocales,
  setLocale as _setLocale,
  getLocale as _getLocale,
  BASE_LOCALES,
  type BaseLocale,
} from '@vue3-monorepo/shared/locale'

/** 与 Pinia `app` store 持久化字段对齐（插件在 store 之后 hydrate） */
function resolveInitialPcLocale(): BaseLocale {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('app')
      if (raw) {
        const data = JSON.parse(raw) as { language?: string }
        const lang = data.language
        if (lang && BASE_LOCALES.includes(lang as BaseLocale)) return lang as BaseLocale
      }
    } catch {
      /* ignore */
    }
    const legacy = localStorage.getItem('language')
    if (legacy && BASE_LOCALES.includes(legacy as BaseLocale)) return legacy as BaseLocale
  }
  return 'zh-CN'
}

const initialLocale = resolveInitialPcLocale()

export const i18n = createI18nLazyShell({
  locale: initialLocale,
  fallbackLocale: 'zh-CN',
})

/** 须在 `app.use(i18n)` 之前调用（bootstrap） */
export async function loadInitialAdminI18n(): Promise<void> {
  await preloadSharedLocales(i18n, initialLocale, 'zh-CN')
}

export function setupI18n(app: App): void {
  app.use(i18n)
}

export async function ensureAdminLocaleLoaded(locale: BaseLocale): Promise<void> {
  await mergeSharedLocaleMessage(i18n, locale)
}

/** 切换语言并写入 `language` 本地键（业务或测试用） */
export async function setLocale(locale: BaseLocale): Promise<void> {
  await ensureAdminLocaleLoaded(locale)
  _setLocale(i18n, locale)
  if (typeof localStorage !== 'undefined') localStorage.setItem('language', locale)
}

export function getLocale(): string {
  return _getLocale(i18n)
}

export { BASE_LOCALES }
export type { BaseLocale }
