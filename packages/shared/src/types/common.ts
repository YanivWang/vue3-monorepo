/**
 * 两端共享的通用基础类型（纯数据结构，UI 无关）
 */

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface KeyValuePair<V = string> {
  key: string
  value: V
}

export interface SelectOption<V = string | number> {
  label: string
  value: V
  disabled?: boolean
  children?: SelectOption<V>[]
}

export interface TreeNode<T = Record<string, unknown>> {
  id: number | string
  label: string
  children?: TreeNode<T>[]
  data?: T
}

export type Nullable<T> = T | null | undefined

export type Awaitable<T> = T | Promise<T>

export type AnyFn = (...args: unknown[]) => unknown
