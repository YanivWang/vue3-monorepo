import axios, { AxiosHeaders } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import type {
  RequestConfig,
  ResponseData,
  CreateHttpOptions,
  TokenProvider,
  LoadingHandler,
  RequestHooks,
  RefreshTokenResult
} from './types'
import { HttpCode } from './types'
import { createNormalizedError, getRequestKey, isSuccessPayload, retryDelay } from './utils'

/**
 * UI 无关的 HTTP 核心。
 *
 * 设计原则：
 * 1. 不直接依赖 Element Plus / Vant / 任何 UI 框架
 * 2. 通过依赖注入：tokenProvider / loading / hooks 将副作用交给 UI 绑定层
 * 3. 刷新 Token 使用「单例 Promise」，并发的 401 请求共享同一次刷新流程
 * 4. 请求/响应异常归一化为 NormalizedError
 */
export class HttpRequest {
  private instance: AxiosInstance
  private baseURL: string
  private successCode: number
  private refreshPath: string
  private tokenProvider?: TokenProvider
  private loading?: LoadingHandler
  private hooks: RequestHooks

  /** 进行中的请求池：key → AbortController */
  private pendingRequests = new Map<string, AbortController>()

  /** 单例刷新 Promise：并发 401 共享同一次刷新 */
  private refreshPromise: Promise<RefreshTokenResult> | null = null

  constructor(options: CreateHttpOptions = {}) {
    const {
      baseURL = '',
      timeout = 10000,
      headers = { 'Content-Type': 'application/json;charset=UTF-8' },
      successCode = 200,
      refreshPath = '/auth/refresh',
      tokenProvider,
      loading,
      hooks = {}
    } = options

    this.baseURL = baseURL
    this.successCode = successCode
    this.refreshPath = refreshPath
    this.tokenProvider = tokenProvider
    this.loading = loading
    this.hooks = hooks

    this.instance = axios.create({ baseURL, timeout, headers })
    this.setupInterceptors()
  }

  /** 若存在同 key 的旧请求则取消；然后将新 controller 加入池 */
  private addPending(config: RequestConfig & InternalAxiosRequestConfig): void {
    const key = getRequestKey(config)
    if (this.pendingRequests.has(key)) {
      this.pendingRequests.get(key)!.abort()
      this.pendingRequests.delete(key)
    }
    const controller = new AbortController()
    config.signal = controller.signal
    this.pendingRequests.set(key, controller)
  }

  /** 请求完成（成功/失败）后从池中移除 */
  private removePending(config: RequestConfig & InternalAxiosRequestConfig): void {
    const key = getRequestKey(config)
    this.pendingRequests.delete(key)
  }

  /** 手动取消指定 key 的请求 */
  cancelRequest(key: string): void {
    if (this.pendingRequests.has(key)) {
      this.pendingRequests.get(key)!.abort()
      this.pendingRequests.delete(key)
    }
  }

  /** 取消所有进行中的请求（页面跳转、退出登录等场景） */
  cancelAllRequests(): void {
    this.pendingRequests.forEach(controller => controller.abort())
    this.pendingRequests.clear()
  }

  /** 获取底层 axios 实例（高级场景使用） */
  getAxiosInstance(): AxiosInstance {
    return this.instance
  }

  /**
   * 执行刷新 Token：如果已有进行中的刷新，直接返回同一个 Promise，避免重复刷新。
   * 默认实现使用原始 axios 调用 `baseURL + refreshPath`；如果业务层提供了 `onRefreshToken`，则优先使用业务实现。
   */
  private refreshToken(): Promise<RefreshTokenResult> {
    if (this.refreshPromise) return this.refreshPromise

    const task = this.hooks.onRefreshToken ? this.hooks.onRefreshToken() : this.defaultRefreshToken()

    this.refreshPromise = task.finally(() => {
      this.refreshPromise = null
    })
    return this.refreshPromise
  }

  /** 核心层兜底实现：POST {baseURL}{refreshPath} with refreshToken */
  private async defaultRefreshToken(): Promise<RefreshTokenResult> {
    const refreshToken = this.tokenProvider?.getRefreshToken()
    if (!refreshToken) throw createNormalizedError('无刷新凭证', { type: 'auth' })

    const url = `${this.baseURL.replace(/\/$/, '')}${this.refreshPath}`
    const { data, status } = await axios.post<unknown>(
      url,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        timeout: 15000
      }
    )
    if (status !== 200) throw createNormalizedError('Token 刷新失败', { type: 'auth' })
    if (
      !isSuccessPayload<RefreshTokenResult>(data) ||
      (data as ResponseData<RefreshTokenResult>).code !== this.successCode
    ) {
      const msg = isSuccessPayload<RefreshTokenResult>(data)
        ? (data as ResponseData<RefreshTokenResult>).message
        : 'Token 刷新失败'
      throw createNormalizedError(msg, { type: 'auth' })
    }
    return (data as ResponseData<RefreshTokenResult>).data
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as RequestConfig & InternalAxiosRequestConfig

        if (customConfig.cancelDuplicate) {
          this.addPending(customConfig)
        }

        if (customConfig.showLoading) {
          this.loading?.onStart()
        }

        if (customConfig.withToken !== false) {
          const token = this.tokenProvider?.getToken()
          if (token) {
            const headers = AxiosHeaders.from(config.headers ?? {})
            headers.set('Authorization', `Bearer ${token}`)
            config.headers = headers
          }
        }

        if (config.method?.toUpperCase() === 'GET') {
          config.params = { _t: Date.now(), ...config.params }
        }

        return config
      },
      (error: unknown) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse<unknown>) => {
        const { data, config } = response
        const customConfig = config as RequestConfig & InternalAxiosRequestConfig

        if (customConfig.cancelDuplicate) this.removePending(customConfig)
        if (customConfig.showLoading) this.loading?.onEnd()

        if (!isSuccessPayload(data) || (data as ResponseData).code !== this.successCode) {
          const msg = isSuccessPayload(data) ? (data as ResponseData).message : '请求失败'
          const err = createNormalizedError(msg || '请求失败', {
            type: 'business',
            code: isSuccessPayload(data) ? (data as ResponseData).code : undefined,
            config: customConfig
          })
          if (customConfig.showError !== false) {
            this.hooks.onBusinessError?.({ error: err, config: customConfig, response })
            this.hooks.onError?.({ error: err, config: customConfig, response })
          }
          return Promise.reject(err)
        }

        return response
      },
      async (error: unknown) => {
        if (!axios.isAxiosError(error)) {
          const normalized = createNormalizedError('未知错误', { type: 'unknown', original: error })
          this.hooks.onError?.({ error: normalized })
          return Promise.reject(normalized)
        }

        const { response, config: requestConfig } = error
        const customConfig = (requestConfig || {}) as RequestConfig & InternalAxiosRequestConfig

        if (customConfig.cancelDuplicate) this.removePending(customConfig)
        if (customConfig.showLoading) this.loading?.onEnd()

        if (axios.isCancel(error) || error.name === 'CanceledError') {
          const canceled = createNormalizedError('请求已取消', {
            type: 'canceled',
            config: customConfig,
            original: error
          })
          return Promise.reject(canceled)
        }

        if (error.code === 'ECONNABORTED') {
          const timeout = createNormalizedError('请求超时，请稍后重试', {
            type: 'timeout',
            config: customConfig,
            original: error
          })
          if (customConfig.showError !== false) {
            this.hooks.onError?.({ error: timeout, config: customConfig, response })
          }
          return Promise.reject(timeout)
        }

        if (!response) {
          const network = createNormalizedError('网络异常，请检查您的网络连接', {
            type: 'network',
            config: customConfig,
            original: error
          })
          if (customConfig.showError !== false) {
            this.hooks.onError?.({ error: network, config: customConfig })
          }
          return Promise.reject(network)
        }

        const { status } = response

        if (status === HttpCode.UNAUTHORIZED) {
          if (customConfig.skipAuthRefresh) {
            const authErr = createNormalizedError('未授权', {
              type: 'auth',
              status,
              config: customConfig,
              original: error
            })
            this.hooks.onUnauthorized?.({ error: authErr, config: customConfig, response })
            return Promise.reject(authErr)
          }

          const hasRefresh = !!this.tokenProvider?.getRefreshToken()
          if (hasRefresh) {
            try {
              const result = await this.refreshToken()
              this.tokenProvider!.setToken(result.accessToken)
              if (result.refreshToken) this.tokenProvider!.setRefreshToken(result.refreshToken)

              const cfg = { ...requestConfig } as RequestConfig & InternalAxiosRequestConfig
              const headers = AxiosHeaders.from(cfg.headers ?? {})
              headers.set('Authorization', `Bearer ${result.accessToken}`)
              cfg.headers = headers
              return await this.instance.request(cfg)
            } catch (e) {
              this.tokenProvider!.removeToken()
              this.tokenProvider!.removeRefreshToken()
              const authErr = createNormalizedError((e as Error)?.message || '登录已过期', {
                type: 'auth',
                status,
                config: customConfig,
                original: e
              })
              this.hooks.onUnauthorized?.({ error: authErr, config: customConfig, response })
              return Promise.reject(authErr)
            }
          } else {
            const authErr = createNormalizedError('登录已过期', {
              type: 'auth',
              status,
              config: customConfig,
              original: error
            })
            this.hooks.onUnauthorized?.({ error: authErr, config: customConfig, response })
            return Promise.reject(authErr)
          }
        }

        const retryCount = customConfig.retryCount ?? 0
        const currentTimes = customConfig._retryTimes ?? 0
        if (retryCount > 0 && currentTimes < retryCount && status >= HttpCode.SERVER_ERROR) {
          customConfig._retryTimes = currentTimes + 1
          await retryDelay(customConfig._retryTimes, customConfig.retryDelay ?? 1000)
          return this.instance.request(customConfig as InternalAxiosRequestConfig)
        }

        const msgMap: Record<number, string> = {
          [HttpCode.FORBIDDEN]: '没有权限访问该资源',
          [HttpCode.NOT_FOUND]: '请求的资源不存在',
          [HttpCode.SERVER_ERROR]: '服务器内部错误，请稍后重试'
        }
        const message = msgMap[status] || (response.data as { message?: string })?.message || `请求失败（${status}）`

        const httpErr = createNormalizedError(message, {
          type: 'http',
          status,
          config: customConfig,
          original: error
        })
        if (customConfig.showError !== false) {
          this.hooks.onError?.({ error: httpErr, config: customConfig, response })
        }
        return Promise.reject(httpErr)
      }
    )
  }

  request<T = unknown>(config: RequestConfig): Promise<T> {
    return this.instance.request<ResponseData<T>>(config).then(res => (res.data as ResponseData<T>).data)
  }

  get<T = unknown>(url: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url, params })
  }

  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }

  delete<T = unknown>(url: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url, params })
  }
}

/**
 * 快速创建 HttpRequest 实例的工厂函数
 */
export function createHttp(options: CreateHttpOptions = {}): HttpRequest {
  return new HttpRequest(options)
}
