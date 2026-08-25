import { createTokenStorage } from '@vue3-monorepo/shared/utils'

/**
 * H5 应用的 token 存储实例。
 *
 * - 与 admin 使用不同的 cookie key，确保两端不共享登录态
 * - admin 侧的 key 来自 `VITE_TOKEN_KEY` / `VITE_REFRESH_TOKEN_KEY`（默认 access_token / refresh_token），
 *   见 apps/pc/pc-admin-template/src/utils/storage.ts
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
