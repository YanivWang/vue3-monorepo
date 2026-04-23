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
  // 缺失翻译时静默 fallback（生产不打印 warning）
  silentTranslationWarn: import.meta.env.PROD,
  silentFallbackWarn: import.meta.env.PROD,
  // 缺失 key 时返回 key 本身而非空字符串
  missing: (_locale, key) => key,
  // 启用数字/日期格式化
  numberFormats: {
    [Language.ZH_CN]: {
      decimal: { style: 'decimal', minimumFractionDigits: 2 },
      currency: { style: 'currency', currency: 'CNY', currencyDisplay: 'symbol' },
      percent: { style: 'percent', minimumFractionDigits: 1 }
    },
    [Language.EN_US]: {
      decimal: { style: 'decimal', minimumFractionDigits: 2 },
      currency: { style: 'currency', currency: 'USD', currencyDisplay: 'symbol' },
      percent: { style: 'percent', minimumFractionDigits: 1 }
    }
  },
  datetimeFormats: {
    [Language.ZH_CN]: {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      long: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      },
      relative: { year: 'numeric', month: 'long', day: 'numeric' }
    },
    [Language.EN_US]: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' },
      relative: { year: 'numeric', month: 'long', day: 'numeric' }
    }
  }
})

export function setupI18n(app: App): void {
  app.use(i18n)
}

export default i18n
