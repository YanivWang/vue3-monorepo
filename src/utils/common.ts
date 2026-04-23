import dayjs from 'dayjs'
import { debounce, throttle } from 'lodash-es'

// ────────────────────────────────────────────────────────────
//  日期时间工具
// ────────────────────────────────────────────────────────────

/** 格式化日期，默认格式 YYYY-MM-DD */
export function formatDate(date: string | number | Date | dayjs.Dayjs, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

/** 格式化日期时间，默认格式 YYYY-MM-DD HH:mm:ss */
export function formatDateTime(date: string | number | Date | dayjs.Dayjs, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format)
}

/** 获取当前时间戳（毫秒） */
export function now(): number {
  return Date.now()
}

// ────────────────────────────────────────────────────────────
//  防抖 / 节流（直接复用 lodash-es）
// ────────────────────────────────────────────────────────────
export { debounce, throttle }

// ────────────────────────────────────────────────────────────
//  URL / 路由工具
// ────────────────────────────────────────────────────────────

/** 解析 URL 查询参数为对象 */
export function parseQuery(search = window.location.search): Record<string, string> {
  const params: Record<string, string> = {}
  new URLSearchParams(search).forEach((value, key) => {
    params[key] = value
  })
  return params
}

/** 对象转 URL 查询字符串（自动过滤 undefined / null 值） */
export function stringifyQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      qs.append(key, String(value))
    }
  })
  return qs.toString()
}

// ────────────────────────────────────────────────────────────
//  字符串工具
// ────────────────────────────────────────────────────────────

/** 首字母大写 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** 驼峰转连字符（camelCase → kebab-case） */
export function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

// ────────────────────────────────────────────────────────────
//  数组工具
// ────────────────────────────────────────────────────────────

/** 数组去重（基础类型） */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/** 根据字段对对象数组去重 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<T[keyof T]>()
  return arr.filter(item => {
    const val = item[key]
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}

/** 将平铺数组转换为树形结构 */
export function arrayToTree<T extends { id: number | string; parentId: number | string | null }>(
  list: T[],
  rootId: number | string | null = null
): (T & { children?: T[] })[] {
  return list
    .filter(item => item.parentId === rootId)
    .map(item => ({
      ...item,
      children: arrayToTree(list, item.id)
    }))
    .map(item => (item.children?.length ? item : { ...item, children: undefined }))
}

// ────────────────────────────────────────────────────────────
//  文件工具
// ────────────────────────────────────────────────────────────

/** 文件大小格式化，返回带单位的字符串 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

// ────────────────────────────────────────────────────────────
//  剪贴板
// ────────────────────────────────────────────────────────────

/** 复制文本到剪贴板 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
  } else {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}
