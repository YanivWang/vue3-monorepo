import http from '@/utils/http'
import { isMockEnabled } from '@/utils/http/config'
import * as userMock from '@/mock/user'
import type { LoginParams, LoginResult, UserInfo, UpdatePasswordParams } from '@/types/api'

function isMock() {
  return isMockEnabled()
}

/** 登录 */
export function login(params: LoginParams): Promise<LoginResult> {
  if (isMock()) {
    return userMock.mockLogin(params)
  }
  return http.post<LoginResult>('/auth/login', params, { withToken: false })
}

/** 登出 */
export function logout(): Promise<void> {
  if (isMock()) {
    return userMock.mockLogout()
  }
  return http.post<void>('/auth/logout')
}

/** 获取当前登录用户信息 */
export function getUserInfo(): Promise<UserInfo> {
  if (isMock()) {
    return userMock.mockGetUserInfo()
  }
  return http.get<UserInfo>('/user/info')
}

/** 修改密码 */
export function updatePassword(params: UpdatePasswordParams): Promise<void> {
  if (isMock()) {
    return Promise.resolve()
  }
  return http.put<void>('/user/password', params)
}

/**
 * 显式调后端刷新；HTTP 层也会自动 refresh，此接口备用手动续期
 */
export function refreshTokenWithHttp(refreshToken: string): Promise<LoginResult> {
  if (isMock()) {
    return userMock.mockRefreshToken(refreshToken)
  }
  return http.post<LoginResult>('/auth/refresh', { refreshToken }, { withToken: false, skipAuthRefresh: true })
}
