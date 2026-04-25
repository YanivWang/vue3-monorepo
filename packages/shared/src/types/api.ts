/**
 * 两端共享的 API 请求/响应基础类型
 * 具体业务接口类型应各自放在 apps 或领域包内
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

/** 后端下发的菜单路由节点（UI 无关描述） */
export interface MenuRoute {
  id: number
  parentId: number
  name: string
  path: string
  component?: string
  redirect?: string
  meta: {
    title: string
    icon?: string
    hidden?: boolean
    keepAlive?: boolean
    requiresAuth?: boolean
    permissions?: string[]
    roles?: string[]
    breadcrumb?: string
    affix?: boolean
    alwaysShow?: boolean
  }
  children?: MenuRoute[]
}
