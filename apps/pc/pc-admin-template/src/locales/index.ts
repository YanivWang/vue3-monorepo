import type { App } from 'vue'
import {
  createI18nInstance,
  setLocale as _setLocale,
  getLocale as _getLocale,
  BASE_LOCALES,
  type BaseLocale
} from '@vue3-monorepo/shared/locale'

/**
 * Admin 端 i18n 实例：直接复用 @vue3-monorepo/shared/locale 的中/英文基础文案。
 * 若业务需要扩展词条，可在此通过 messages 参数合并更多 messages（见 @vue3-monorepo/shared/locale README）。
 */
export const i18n = createI18nInstance({
  locale: ((typeof localStorage !== 'undefined' && (localStorage.getItem('language') as BaseLocale)) ||
    'zh-CN') as BaseLocale
})

export function setupI18n(app: App): void {
  app.use(i18n)
}

/** 切换当前语言 */
export function setLocale(locale: BaseLocale): void {
  _setLocale(i18n, locale)
}

/** 读取当前语言 */
export function getLocale(): string {
  return _getLocale(i18n)
}

export { BASE_LOCALES }
export type { BaseLocale }
