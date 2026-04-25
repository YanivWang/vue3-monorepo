import { createTokenStorage } from '@vue3-mono/utils'

/**
 * 应用级 Token 存储：Cookie 持久化，key 从 env 读取，全局共享一份实例
 */
export const tokenStorage = createTokenStorage({
  tokenKey: import.meta.env.VITE_TOKEN_KEY || 'access_token',
  refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token'
})

export const getToken = () => tokenStorage.getToken() ?? ''
export const setToken = (val: string) => tokenStorage.setToken(val)
export const removeToken = () => tokenStorage.removeToken()
export const getRefreshToken = () => tokenStorage.getRefreshToken() ?? ''
export const setRefreshToken = (val: string) => tokenStorage.setRefreshToken(val)
export const removeRefreshToken = () => tokenStorage.removeRefreshToken()
