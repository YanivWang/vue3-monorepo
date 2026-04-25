import { createH5Http } from '@vue3-mono/request-h5'
import { tokenStorage } from '@/utils/tokenStorage'

/**
 * H5 HTTP 单例（计划约定：`apps/h5/src/plugins/http.ts` 为唯一装配点）
 */
export const http = createH5Http({
  baseURL: (import.meta.env.VITE_API_PREFIX as string) || '/api',
  timeout: 15000,
  tokenStorage,
  loginPath: '/login',
  onLogout: () => {
    tokenStorage.removeToken()
    tokenStorage.removeRefreshToken()
  }
})
