import axios from 'axios'
import { AxiosHeaders } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, getRefreshToken, removeToken, removeRefreshToken, setToken, setRefreshToken } from '@/utils/storage'
import { getApiBaseURL, getApiSuccessCode, getRefreshPath } from '@/utils/http/config'
import { showLoading, hideLoading } from '@/utils/http/loading'
import type { RequestConfig, ResponseData } from './types'
import type { LoginResult } from '@/types/api'

const SUCCESS_CODE = getApiSuccessCode()

const enum HttpCode {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

/** 无 refresh 时 401 弹窗防重复 */
let isAuthDialogOpen = false

/** refresh 中 + 挂起请求回调 */
let isRefreshing = false
type RefreshListener = (err: Error | null, accessToken?: string) => void
const refreshWaiters: RefreshListener[] = []

function pushRefreshListener(fn: RefreshListener) {
  refreshWaiters.push(fn)
}

function notifyRefreshDone(err: Error | null, accessToken?: string) {
  const list = refreshWaiters.splice(0, refreshWaiters.length)
  list.forEach(fn => fn(err, accessToken))
}

function isSuccessPayload<T>(data: unknown): data is ResponseData<T> {
  return typeof data === 'object' && data !== null && 'code' in data && 'data' in data
}

/** 指数退避延迟 */
function retryDelay(times: number, baseDelay = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, times - 1)))
}

class HttpRequest {
  private instance: AxiosInstance
  private baseURL: string

  constructor(config: RequestConfig) {
    this.baseURL = typeof config.baseURL === 'string' ? config.baseURL : getApiBaseURL()
    this.instance = axios.create({ ...config, baseURL: this.baseURL })
    this.setupInterceptors()
  }

  /** 用原始 axios 调 refresh，避免与实例拦截器互相递归 */
  private async doRefreshRequest(): Promise<LoginResult> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new Error('无刷新凭证')

    const url = `${this.baseURL.replace(/\/$/, '')}${getRefreshPath()}`
    const { data, status } = await axios.post<unknown>(
      url,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        timeout: 15000
      }
    )
    if (status !== 200) throw new Error('Token 刷新失败')
    if (!isSuccessPayload<LoginResult>(data) || (data as ResponseData<LoginResult>).code !== SUCCESS_CODE) {
      const msg = isSuccessPayload<LoginResult>(data) ? (data as ResponseData<LoginResult>).message : 'Token 刷新失败'
      throw new Error(msg)
    }
    return (data as ResponseData<LoginResult>).data
  }

  private setupInterceptors(): void {
    // ── 请求拦截 ──────────────────────────────────────────────────────────
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as RequestConfig & InternalAxiosRequestConfig

        if (customConfig.showLoading) {
          showLoading()
        }

        if (customConfig.withToken !== false) {
          const token = getToken()
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

    // ── 响应拦截 ──────────────────────────────────────────────────────────
    this.instance.interceptors.response.use(
      (response: AxiosResponse<unknown>) => {
        const { data, config } = response
        const customConfig = config as RequestConfig

        if (customConfig.showLoading) hideLoading()

        if (!isSuccessPayload(data) || (data as ResponseData).code !== SUCCESS_CODE) {
          const msg = isSuccessPayload(data) ? (data as ResponseData).message : '请求失败'
          if (customConfig.showError !== false) ElMessage.error(msg || '请求失败')
          return Promise.reject(new Error(msg))
        }

        return response
      },
      async (error: unknown) => {
        if (!axios.isAxiosError(error)) {
          ElMessage.error('未知错误')
          return Promise.reject(error)
        }

        const { response, config: requestConfig } = error
        const customConfig = (requestConfig || {}) as RequestConfig

        if (customConfig.showLoading) hideLoading()

        // 网络超时
        if (error.code === 'ECONNABORTED') {
          if (customConfig.showError !== false) ElMessage.error('请求超时，请稍后重试')
          return Promise.reject(error)
        }

        // 无响应（断网）
        if (!response) {
          if (customConfig.showError !== false) ElMessage.error('网络异常，请检查您的网络连接')
          return Promise.reject(error)
        }

        const { status } = response

        // 401 自动刷新 Token
        if (status === HttpCode.UNAUTHORIZED) {
          if (customConfig.skipAuthRefresh) return Promise.reject(error)

          const hasRefresh = !!getRefreshToken()
          if (hasRefresh) {
            return new Promise((resolve, reject) => {
              pushRefreshListener((err, newAccess) => {
                if (err || !newAccess) {
                  reject(err || error)
                  return
                }
                const cfg = { ...requestConfig } as RequestConfig & InternalAxiosRequestConfig
                const headers = AxiosHeaders.from(cfg.headers ?? {})
                headers.set('Authorization', `Bearer ${newAccess}`)
                cfg.headers = headers
                this.instance.request(cfg).then(resolve).catch(reject)
              })
              if (isRefreshing) return
              isRefreshing = true
              this.doRefreshRequest()
                .then(res => {
                  setToken(res.accessToken)
                  if (res.refreshToken) setRefreshToken(res.refreshToken)
                  notifyRefreshDone(null, res.accessToken)
                })
                .catch((e: Error) => {
                  removeToken()
                  removeRefreshToken()
                  notifyRefreshDone(e)
                  this.showLoginExpired()
                })
                .finally(() => {
                  isRefreshing = false
                })
            })
          } else {
            this.handleNoRefresh401()
            return Promise.reject(error)
          }
        }

        // 重试逻辑（排除 401/403）
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
        if (customConfig.showError !== false) {
          ElMessage.error(msgMap[status] || (response.data as { message?: string })?.message || `请求失败（${status}）`)
        }

        return Promise.reject(error)
      }
    )
  }

  private showLoginExpired(): void {
    if (isAuthDialogOpen) return
    isAuthDialogOpen = true
    ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        removeToken()
        removeRefreshToken()
        window.location.href = '/login'
      })
      .finally(() => {
        isAuthDialogOpen = false
      })
  }

  private handleNoRefresh401(): void {
    this.showLoginExpired()
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

const http = new HttpRequest({
  baseURL: getApiBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

export default http
export { HttpRequest }
export type { RequestConfig, ResponseData }
