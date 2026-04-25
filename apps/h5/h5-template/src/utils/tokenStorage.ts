import { createTokenStorage } from '@vue3-mono/utils'

/**
 * H5 应用的 token 存储实例。
 *
 * - 与 admin 使用不同的 cookie key，确保两端不共享登录态
 * - admin 建议 'ADMIN_TOKEN' / 'ADMIN_REFRESH_TOKEN'（已约定）
 */
export const tokenStorage = createTokenStorage({
  tokenKey: 'H5_TOKEN',
  refreshTokenKey: 'H5_REFRESH_TOKEN',
  tokenExpires: 1,
  refreshExpires: 7
})

export const getToken = () => tokenStorage.getToken()
export const setToken = (t: string) => tokenStorage.setToken(t)
export const removeToken = () => tokenStorage.removeToken()
export const getRefreshToken = () => tokenStorage.getRefreshToken()
