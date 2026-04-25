/**
 * 两端共享的常量（不带运行时/UI 依赖）
 */

/** 空字符串 */
export const EMPTY_STRING = ''

/** 默认分页参数 */
export const DEFAULT_PAGINATION = Object.freeze({
  page: 1,
  pageSize: 10
})

/** 默认请求超时时间（毫秒） */
export const DEFAULT_REQUEST_TIMEOUT = 10_000

/** refresh 请求超时时间（毫秒） */
export const DEFAULT_REFRESH_TIMEOUT = 15_000

/** Token 默认有效期（天） */
export const DEFAULT_TOKEN_EXPIRES_DAYS = 1

/** Refresh Token 默认有效期（天） */
export const DEFAULT_REFRESH_TOKEN_EXPIRES_DAYS = 7

/** 业务成功码 */
export const DEFAULT_SUCCESS_CODE = 200

/** 通用业务异常状态值 */
export const HTTP_STATUS = Object.freeze({
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
})
