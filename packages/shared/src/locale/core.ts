import { createI18n, type I18nOptions, type I18n, type Composer } from 'vue-i18n'
import type { App } from 'vue'

import { defaultMessages, type BaseLocale, type BaseMessages } from './messages'
import { defaultNumberFormats, defaultDatetimeFormats } from './formats'

export interface CreateI18nOptions {
  /** 初始语言（默认 'zh-CN'） */
  locale?: string
  /** fallback 语言（默认 'zh-CN'） */
  fallbackLocale?: string
  /** 额外合并到默认消息的 messages（以语言为键） */
  messages?: Record<string, Record<string, unknown>>
  /** 是否合并默认消息，默认 true；设为 false 时仅使用传入 messages */
  mergeDefaults?: boolean
  /** 额外 numberFormats（按语言覆盖/合并默认） */
  numberFormats?: I18nOptions['numberFormats']
  /** 额外 datetimeFormats（按语言覆盖/合并默认） */
  datetimeFormats?: I18nOptions['datetimeFormats']
  /** missing key 处理，默认返回 key */
  missing?: I18nOptions['missing']
  /** 静默警告开关 */
  silentTranslationWarn?: boolean
  silentFallbackWarn?: boolean
}

/** 合并两层对象（浅合并 root，深合并 key → messages） */
function mergeMessages(
  base: Record<string, Record<string, unknown>>,
  extra: Record<string, Record<string, unknown>> = {},
): Record<string, Record<string, unknown>> {
  const merged: Record<string, Record<string, unknown>> = { ...base }
  for (const lang of Object.keys(extra)) {
    merged[lang] = { ...(base[lang] || {}), ...extra[lang] }
  }
  return merged
}

/**
 * 创建 vue-i18n 实例（legacy: false）
 * - 自带 zh-CN / en-US 基础消息 + 数字/日期格式化
 * - 可通过 messages 参数合并扩展业务文案
 */
export function createI18nInstance(options: CreateI18nOptions = {}): I18n {
  const {
    locale = 'zh-CN',
    fallbackLocale = 'zh-CN',
    messages: extraMessages = {},
    mergeDefaults = true,
    numberFormats,
    datetimeFormats,
    missing = (_l, key) => key,
    silentTranslationWarn = true,
    silentFallbackWarn = true,
  } = options

  const baseMessages = mergeDefaults ? (defaultMessages as unknown as Record<string, Record<string, unknown>>) : {}
  const finalMessages = mergeMessages(baseMessages, extraMessages)

  return createI18n({
    legacy: false,
    locale,
    fallbackLocale,
    messages: finalMessages as I18nOptions['messages'],
    numberFormats: {
      ...(defaultNumberFormats as unknown as I18nOptions['numberFormats']),
      ...(numberFormats || {}),
    },
    datetimeFormats: {
      ...(defaultDatetimeFormats as unknown as I18nOptions['datetimeFormats']),
      ...(datetimeFormats || {}),
    },
    missing,
    silentTranslationWarn,
    silentFallbackWarn,
  })
}

/**
 * 向 Vue App 安装 i18n 插件
 */
export function setupI18n(app: App, i18n: I18n): void {
  app.use(i18n)
}

/**
 * 切换当前 locale（Composer/Legacy 均适用）
 */
export function setLocale(i18n: I18n, locale: string): void {
  const root = i18n.global as Composer | { locale: { value: string } }
  if ('locale' in root && typeof (root as Composer).locale === 'object') {
    ;(root as Composer).locale.value = locale
  } else {
    ;(i18n.global as unknown as { locale: string }).locale = locale
  }
}

/**
 * 读取当前 locale
 */
export function getLocale(i18n: I18n): string {
  const root = i18n.global as Composer | { locale: string }
  const loc = (root as Composer).locale
  if (loc && typeof loc === 'object' && 'value' in loc) return String(loc.value)
  return String((root as { locale: string }).locale)
}

export type { BaseLocale, BaseMessages }
