import { createI18n, type Composer, type I18n, type I18nOptions } from 'vue-i18n'

import { defaultDatetimeFormats, defaultNumberFormats } from './formats'
import type { BaseLocale } from './messages'

const sharedLocaleLoaded = new WeakMap<I18n, Set<BaseLocale>>()

function sharedLoadedSet(i18n: I18n): Set<BaseLocale> {
  let s = sharedLocaleLoaded.get(i18n)
  if (!s) {
    s = new Set()
    sharedLocaleLoaded.set(i18n, s)
  }
  return s
}

async function fetchSharedLocaleMessages(locale: BaseLocale): Promise<Record<string, unknown>> {
  switch (locale) {
    case 'zh-CN':
      return (await import('./messages/zh-CN')).default
    case 'en-US':
      return (await import('./messages/en-US')).default
    default: {
      const _exhaustive: never = locale
      return _exhaustive
    }
  }
}

export interface CreateI18nLazyShellOptions {
  locale: BaseLocale
  /** 缺省为 zh-CN，与既有模板一致 */
  fallbackLocale?: BaseLocale
  missing?: I18nOptions['missing']
  silentTranslationWarn?: boolean
  silentFallbackWarn?: boolean
}

/**
 * 创建「空壳」vue-i18n 实例：不含任何 locale 词条，须再调用 {@link mergeSharedLocaleMessage} /
 * {@link preloadSharedLocales} 注入。用于与 Vite 动态 import 拆分语言包 chunk。
 */
export function createI18nLazyShell(options: CreateI18nLazyShellOptions): I18n {
  const fallbackLocale = options.fallbackLocale ?? 'zh-CN'
  const { locale, missing = (_l, key) => key, silentTranslationWarn = true, silentFallbackWarn = true } = options

  return createI18n({
    legacy: false,
    locale,
    fallbackLocale,
    messages: {},
    numberFormats: defaultNumberFormats,
    datetimeFormats: defaultDatetimeFormats,
    missing,
    silentTranslationWarn,
    silentFallbackWarn,
  })
}

/** 按需拉取并合并某一语言的 shared 基础词条（同一 I18n 实例上幂等） */
export async function mergeSharedLocaleMessage(i18n: I18n, locale: BaseLocale): Promise<void> {
  const set = sharedLoadedSet(i18n)
  if (set.has(locale)) return
  const messages = await fetchSharedLocaleMessages(locale)
  const composer = i18n.global as Composer
  composer.mergeLocaleMessage(locale, messages)
  set.add(locale)
}

/**
 * 预加载当前语言与 fallback（若不同），避免 fallback 链上缺 key。
 */
export async function preloadSharedLocales(
  i18n: I18n,
  locale: BaseLocale,
  fallbackLocale: BaseLocale = 'zh-CN',
): Promise<void> {
  const need = new Set<BaseLocale>([locale])
  if (fallbackLocale !== locale) need.add(fallbackLocale)
  await Promise.all([...need].map((l) => mergeSharedLocaleMessage(i18n, l)))
}
