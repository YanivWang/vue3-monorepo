/**
 * 默认的 vue-i18n numberFormats / datetimeFormats（覆盖 zh-CN / en-US）
 * 消费方可在 createI18nInstance 中覆盖
 */
export const defaultNumberFormats = {
  'zh-CN': {
    decimal: { style: 'decimal', minimumFractionDigits: 2 },
    currency: { style: 'currency', currency: 'CNY', currencyDisplay: 'symbol' },
    percent: { style: 'percent', minimumFractionDigits: 1 }
  },
  'en-US': {
    decimal: { style: 'decimal', minimumFractionDigits: 2 },
    currency: { style: 'currency', currency: 'USD', currencyDisplay: 'symbol' },
    percent: { style: 'percent', minimumFractionDigits: 1 }
  }
} as const

export const defaultDatetimeFormats = {
  'zh-CN': {
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
  'en-US': {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    },
    relative: { year: 'numeric', month: 'long', day: 'numeric' }
  }
} as const
