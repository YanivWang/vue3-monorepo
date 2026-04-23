/**
 * 与「业务成功码、鉴权、请求配置」相关的单一配置，供拦截器与刷新逻辑读取
 */
export function getApiSuccessCode(): number {
  const raw = import.meta.env.VITE_API_SUCCESS_CODE
  if (raw === undefined || raw === '') return 200
  const n = Number(raw)
  return Number.isNaN(n) ? 200 : n
}

export function getApiBaseURL(): string {
  return import.meta.env.VITE_API_PREFIX || '/api'
}

/** Token 刷新接口路径（相对于 baseURL），可通过环境变量覆盖 */
export function getRefreshPath(): string {
  return import.meta.env.VITE_REFRESH_PATH || '/auth/refresh'
}
