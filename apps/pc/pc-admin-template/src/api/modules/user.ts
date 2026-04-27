import http from '@/utils/http'
import type { LoginParams, LoginResult, UserInfo, UpdatePasswordParams } from '@vue3-monorepo/shared/types'

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

/** 显式刷新 Token（HTTP 层会自动 refresh，此接口备用手动续期） */
export function refreshTokenApi(refreshToken: string): Promise<LoginResult> {
  return http.post<LoginResult>('/auth/refresh', { refreshToken }, { withToken: false, skipAuthRefresh: true })
}
