import zhCN from './zh-CN'
import enUS from './en-US'

export { zhCN, enUS }

/** 基础 messages schema（zh-CN 为「契约源」） */
export type BaseMessages = typeof zhCN

/** 语言 code（可被上层 enum Language 继承） */
export const BASE_LOCALES = ['zh-CN', 'en-US'] as const
export type BaseLocale = (typeof BASE_LOCALES)[number]

/** 默认消息集合（语言 → messages） */
export const defaultMessages: Record<BaseLocale, BaseMessages> = {
  'zh-CN': zhCN,
  'en-US': enUS
}
