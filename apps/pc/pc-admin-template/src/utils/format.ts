import type { Composer } from 'vue-i18n'
import { i18n } from '@/locales'

/**
 * 格式化工具函数
 * 基于 vue-i18n 的 n()/d() 以及 Intl API，支持多语言自动适配
 *
 * @example
 * formatCurrency(1234.56)          // '¥1,234.56'（zh-CN）或 '$1,234.56'（en-US）
 * formatDate(new Date(), 'short')  // '2024/01/15'（zh-CN）或 'Jan 15, 2024'（en-US）
 * formatPercent(0.856)             // '85.6%'
 * formatFileSize(1024 * 1024)      // '1 MB'（尾部 0 会被 parseFloat 去掉）
 */

/** 取 Composer 模式下的 i18n global（legacy: false 时必为 Composer） */
function global(): Composer {
  return i18n.global as unknown as Composer
}

// ── 数字格式化 ────────────────────────────────────────────────

/** 货币格式化 */
export function formatCurrency(value: number): string {
  return global().n(value, 'currency')
}

/** 小数格式化（保留两位小数） */
export function formatDecimal(value: number): string {
  return global().n(value, 'decimal')
}

/** 百分比格式化 */
export function formatPercent(value: number): string {
  return global().n(value, 'percent')
}

/** 千分位整数 */
export function formatInteger(value: number): string {
  return new Intl.NumberFormat(String(global().locale.value)).format(Math.round(value))
}

// ── 日期格式化 ────────────────────────────────────────────────

type DateInput = Date | string | number

function toDate(val: DateInput): Date {
  if (val instanceof Date) return val
  return new Date(val)
}

/** 短日期格式：2024/01/15 / Jan 15, 2024 */
export function formatDate(value: DateInput): string {
  return global().d(toDate(value), 'short')
}

/** 完整日期时间：2024/01/15 14:30:00 */
export function formatDateTime(value: DateInput): string {
  return global().d(toDate(value), 'long')
}

/** 本地化长日期：2024年1月15日 / January 15, 2024 */
export function formatDateLong(value: DateInput): string {
  return global().d(toDate(value), 'relative')
}

/**
 * 相对时间（几分钟前/几天前）
 * 使用 Intl.RelativeTimeFormat，兼容所有现代浏览器
 */
export function formatRelativeTime(value: DateInput): string {
  const date = toDate(value)
  const now = Date.now()
  const diffMs = date.getTime() - now
  const absDiff = Math.abs(diffMs)

  const rtf = new Intl.RelativeTimeFormat(String(global().locale.value), { numeric: 'auto' })

  if (absDiff < 60_000) return rtf.format(Math.round(diffMs / 1000), 'second')
  if (absDiff < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), 'minute')
  if (absDiff < 86_400_000) return rtf.format(Math.round(diffMs / 3_600_000), 'hour')
  if (absDiff < 2_592_000_000) return rtf.format(Math.round(diffMs / 86_400_000), 'day')
  if (absDiff < 31_536_000_000) return rtf.format(Math.round(diffMs / 2_592_000_000), 'month')
  return rtf.format(Math.round(diffMs / 31_536_000_000), 'year')
}

// ── 文件大小 ──────────────────────────────────────────────────

/**
 * 文件大小格式化
 * @param bytes 字节数
 * @param decimals 小数位数，默认 2
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}
