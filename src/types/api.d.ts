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

/** 后端下发的菜单路由节点 */
export interface MenuRoute {
  /** 菜单 ID */
  id: number
  /** 父级 ID，顶层为 0 */
  parentId: number
  /** 路由名称（唯一，对应 RouteRecordRaw.name） */
  name: string
  /** 路由路径 */
  path: string
  /** 组件路径（相对 src/views/，不含 .vue），如 "home/index" */
  component?: string
  /** 重定向路径 */
  redirect?: string
  /** 路由元信息 */
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
  /** 子菜单 */
  children?: MenuRoute[]
}
