import { watch } from 'vue'
import type { App } from 'vue'
import type { I18n } from 'vue-i18n'
import { Locale as VantLocale } from 'vant'
import type { Composer } from 'vue-i18n'
import {
  createI18nLazyShell,
  mergeSharedLocaleMessage,
  setLocale as _setLocale,
  getLocale as _getLocale,
  BASE_LOCALES,
  type BaseLocale
} from '@vue3-monorepo/shared/locale'

const PINIA_H5_APP_KEY = 'h5-app'

const h5BundleLoaded = new WeakMap<I18n, Set<BaseLocale>>()

function h5LoadedSet(i18n: I18n): Set<BaseLocale> {
  let s = h5BundleLoaded.get(i18n)
  if (!s) {
    s = new Set()
    h5BundleLoaded.set(i18n, s)
  }
  return s
}

async function mergeH5AppBundle(i18n: I18n, locale: BaseLocale): Promise<void> {
  const set = h5LoadedSet(i18n)
  if (set.has(locale)) return
  const mod = locale === 'zh-CN' ? await import('@/locales/bundles/zh-CN') : await import('@/locales/bundles/en-US')
  const composer = i18n.global as Composer
  composer.mergeLocaleMessage(locale, mod.default as Record<string, unknown>)
  set.add(locale)
}

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

async function applyVantLocale(locale: string): Promise<void> {
  if (locale.startsWith('zh')) {
    const zhCN = (await import('vant/es/locale/lang/zh-CN')).default
    VantLocale.use('zh-CN', zhCN)
  } else {
    const enUS = (await import('vant/es/locale/lang/en-US')).default
    VantLocale.use('en-US', enUS)
  }
}

const initialLocale = resolveInitialLocale()

export const i18n = createI18nLazyShell({
  locale: initialLocale,
  fallbackLocale: 'zh-CN'
})

/** 合并 shared 词条 + H5 业务 bundle（幂等） */
export async function ensureH5LocaleReady(locale: BaseLocale): Promise<void> {
  await mergeSharedLocaleMessage(i18n, locale)
  await mergeH5AppBundle(i18n, locale)
}

export async function preloadH5I18nMessages(locale: BaseLocale, fallbackLocale: BaseLocale = 'zh-CN'): Promise<void> {
  const need = new Set<BaseLocale>([locale])
  if (fallbackLocale !== locale) need.add(fallbackLocale)
  await Promise.all([...need].map(l => ensureH5LocaleReady(l)))
  await applyVantLocale(locale)
}

/** 须在 `app.use(i18n)` 之前调用 */
export async function loadInitialH5I18n(): Promise<void> {
  await preloadH5I18nMessages(initialLocale, 'zh-CN')
}

const composer = i18n.global as unknown as Composer
watch(
  () => composer.locale.value,
  lang => {
    void applyVantLocale(String(lang))
  },
  { immediate: false }
)

export function setupI18n(app: App): void {
  app.use(i18n)
}

export async function setLocale(locale: BaseLocale): Promise<void> {
  await ensureH5LocaleReady(locale)
  _setLocale(i18n, locale)
}

export function getLocale(): string {
  return _getLocale(i18n)
}

export { BASE_LOCALES }
export type { BaseLocale }
