import type { AxiosRequestConfig } from 'axios'

/**
 * 扩展 AxiosRequestConfig，增加自定义配置项
 */
export interface RequestConfig extends AxiosRequestConfig {
  /** 是否显示加载动画，默认 false */
  showLoading?: boolean
  /** 是否显示错误提示，默认 true */
  showError?: boolean
  /** 是否携带 Token，默认 true */
  withToken?: boolean
  /**
   * 为 true 时不走 401 自动刷新/重试逻辑，避免 refresh 请求自身递归
   */
  skipAuthRefresh?: boolean
  /** 请求重试次数 */
  retryCount?: number
  /** 请求重试间隔（ms） */
  retryDelay?: number
  /** 当前重试次数（内部使用） */
  _retryTimes?: number
  /**
   * 为 true 时，若存在相同 key 的进行中请求，自动取消旧请求再发新请求
   * 适用于搜索联想、频繁切换 tab 等场景
   */
  cancelDuplicate?: boolean
  /**
   * 自定义请求唯一键，用于 cancelDuplicate 去重判断
   * 默认值：`${method}:${url}`
   */
  requestKey?: string
}

/** 统一后端响应结构 */
export interface ResponseData<T = unknown> {
  code: number
  message: string
  data: T
}
