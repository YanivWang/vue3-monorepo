/**
 * API 相关类型声明
 */

/** 统一后端响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  roles: string[]
  permissions: string[]
}

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
}

/** 登录响应数据 */
export interface LoginResult {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

/** 修改密码请求参数 */
export interface UpdatePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
