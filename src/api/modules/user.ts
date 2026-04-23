import http from '@/utils/http'
import type { LoginParams, LoginResult, UserInfo, UpdatePasswordParams } from '@/types/api'

/** 用户相关 API */

/** 登录 */
export function login(params: LoginParams): Promise<LoginResult> {
  return http.post<LoginResult>('/auth/login', params, { withToken: false })
}

/** 登出 */
export function logout(): Promise<void> {
  return http.post<void>('/auth/logout')
}

/** 获取当前登录用户信息 */
export function getUserInfo(): Promise<UserInfo> {
  return http.get<UserInfo>('/user/info')
}

/** 修改密码 */
export function updatePassword(params: UpdatePasswordParams): Promise<void> {
  return http.put<void>('/user/password', params)
}

/** 刷新 Token */
export function refreshToken(refreshToken: string): Promise<LoginResult> {
  return http.post<LoginResult>('/auth/refresh', { refreshToken }, { withToken: false })
}
