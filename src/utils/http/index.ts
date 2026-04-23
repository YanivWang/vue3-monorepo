import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from '@/utils/storage'
import type { RequestConfig, ResponseData } from './types'

/** HTTP 业务状态码 */
const enum HttpCode {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

/** 防重复提示：避免多个接口同时 401 弹出多次 */
let isRefreshing = false

class HttpRequest {
  private instance: AxiosInstance

  constructor(config: RequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  /** 配置请求/响应拦截器 */
  private setupInterceptors(): void {
    // ── 请求拦截器 ──────────────────────────────────────────────────────────
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as RequestConfig & InternalAxiosRequestConfig

        // 默认携带 token，除非显式设置 withToken: false
        if (customConfig.withToken !== false) {
          const token = getToken()
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
          }
        }

        // 防止 GET 请求缓存
        if (config.method?.toUpperCase() === 'GET') {
          config.params = {
            _t: Date.now(),
            ...config.params
          }
        }

        return config
      },
      (error: unknown) => {
        return Promise.reject(error)
      }
    )

    // ── 响应拦截器 ──────────────────────────────────────────────────────────
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ResponseData>) => {
        const { data, config } = response
        const customConfig = config as RequestConfig

        // debugger

        // 业务状态码非 200 视为错误
        if (data.code !== HttpCode.SUCCESS) {
          if (customConfig.showError !== false) {
            ElMessage.error(data.message || '请求失败')
          }
          return Promise.reject(new Error(data.message || '请求失败'))
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

        // 网络超时
        if (error.code === 'ECONNABORTED') {
          ElMessage.error('请求超时，请稍后重试')
          return Promise.reject(error)
        }

        // 网络断开
        if (!response) {
          ElMessage.error('网络异常，请检查您的网络连接')
          return Promise.reject(error)
        }

        const { status } = response

        switch (status) {
          case HttpCode.UNAUTHORIZED:
            // 防止多次弹出登录过期提示
            if (!isRefreshing) {
              isRefreshing = true
              ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
                confirmButtonText: '重新登录',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                  removeToken()
                  // 跳转至登录页，重置路由
                  window.location.href = '/login'
                })
                .finally(() => {
                  isRefreshing = false
                })
            }
            break

          case HttpCode.FORBIDDEN:
            ElMessage.error('没有权限访问该资源')
            break

          case HttpCode.NOT_FOUND:
            ElMessage.error('请求的资源不存在')
            break

          case HttpCode.SERVER_ERROR:
            ElMessage.error('服务器内部错误，请稍后重试')
            break

          default:
            if (customConfig.showError !== false) {
              ElMessage.error((response.data as { message?: string })?.message || `请求失败（${status}）`)
            }
        }

        return Promise.reject(error)
      }
    )
  }

  /** 通用请求方法，返回剥离后的 data 字段 */
  request<T = unknown>(config: RequestConfig): Promise<T> {
    return this.instance.request<ResponseData<T>>(config).then(res => res.data.data)
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

/** 导出默认请求实例 */
const http = new HttpRequest({
  baseURL: import.meta.env.VITE_API_PREFIX || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

export default http
export { HttpRequest }
export type { RequestConfig, ResponseData }
