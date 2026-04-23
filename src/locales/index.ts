import { createI18n } from 'vue-i18n'
import type { App } from 'vue'
import zhCN from './zh-CN'
import enUS from './en-US'
import { lsGet } from '@/utils/storage'
import { Language, StorageKey } from '@/enums'

export type LocaleMessages = typeof zhCN

const messages = {
  [Language.ZH_CN]: zhCN,
  [Language.EN_US]: enUS
}

export const i18n = createI18n({
  legacy: false,
  locale: lsGet<Language>(StorageKey.LANGUAGE) ?? Language.ZH_CN,
  fallbackLocale: Language.ZH_CN,
  messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true
})

export function setupI18n(app: App): void {
  app.use(i18n)
}

export default i18n
