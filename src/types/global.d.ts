/**
 * 全局通用类型声明
 */

/** 分页请求参数 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** 分页响应数据 */
export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 通用键值对 */
export interface KeyValuePair<V = string> {
  key: string
  value: V
}

/** 通用选项类型（用于 Select、Radio 等） */
export interface SelectOption<V = string | number> {
  label: string
  value: V
  disabled?: boolean
  children?: SelectOption<V>[]
}

/** 树形结构节点 */
export interface TreeNode<T = Record<string, unknown>> {
  id: number | string
  label: string
  children?: TreeNode<T>[]
  data?: T
}

