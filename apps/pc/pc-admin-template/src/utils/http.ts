import { createPcHttp } from '@vue3-mono/request-pc'

// DEV + mock：同源 /api，经 devServer 走 vite-plugin-mock；否则直连 VITE_API_BASE_URL（未起服务会报网络异常）
const baseURL = (() => {
  const useDevMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
  const root = useDevMock ? '' : (import.meta.env.VITE_API_BASE_URL ?? '')
  const prefix = import.meta.env.VITE_API_PREFIX ?? ''
  if (!root && !prefix) return ''
  return `${String(root).replace(/\/$/, '')}${prefix.startsWith('/') ? prefix : `/${prefix}`}`
})()

const successCode = import.meta.env.VITE_API_SUCCESS_CODE ? Number(import.meta.env.VITE_API_SUCCESS_CODE) : 200

/**
 * Admin 端全局 HTTP 实例（基于 @vue3-mono/request-pc，内置 Element Plus 反馈）
 */
const http = createPcHttp({
  baseURL,
  successCode,
  refreshPath: import.meta.env.VITE_REFRESH_PATH || '/auth/refresh',
  tokenKey: import.meta.env.VITE_TOKEN_KEY || 'access_token',
  refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token',
  loginPath: '/login'
})

export default http
export { http }
