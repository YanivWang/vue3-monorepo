import { createH5Http } from '@vue3-monorepo/shared/request-h5'
import { tokenStorage } from '@/utils/tokenStorage'

/**
 * H5 HTTP 单例：本文件是 H5 侧唯一的 http 装配点，`@/api/http` 仅做再导出
 */
export const http = createH5Http({
  baseURL: import.meta.env.VITE_API_PREFIX || '/api',
  timeout: 15000,
  tokenStorage,
  loginPath: '/login',
  onLogout: () => {
    tokenStorage.removeToken()
    tokenStorage.removeRefreshToken()
  },
})
