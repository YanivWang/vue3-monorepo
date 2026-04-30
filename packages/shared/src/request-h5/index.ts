import { createHttp, type CreateHttpOptions, type HttpRequest } from '@vue3-monorepo/request-core'
import { createTokenStorage, type TokenStorage } from '@vue3-monorepo/shared/utils'
import { createVantLoadingHandler } from './loading'
import { createH5Hooks, type H5PresetOptions } from './preset'

export * from './preset'
export * from './loading'

export interface CreateH5HttpOptions
  extends Omit<CreateHttpOptions, 'tokenProvider' | 'loading' | 'hooks'>, H5PresetOptions {
  /** Token 存储 key，默认 'access_token' */
  tokenKey?: string
  /** Refresh Token 存储 key，默认 'refresh_token' */
  refreshTokenKey?: string
  /** Token 存储有效期（天），默认 1 */
  tokenExpires?: number
  /** Refresh Token 存储有效期（天），默认 7 */
  refreshExpires?: number
  /** 已创建好的 token storage 实例（传入后忽略 tokenKey/refreshTokenKey） */
  tokenStorage?: TokenStorage
  /** 覆盖/扩展默认钩子 */
  hooks?: Partial<CreateHttpOptions['hooks']>
  /** 是否启用 Loading 默认处理，默认 true */
  enableLoading?: boolean
  /** 自定义 Loading options */
  loadingOptions?: Parameters<typeof createVantLoadingHandler>[0]
}

/**
 * 创建 H5 端 HttpRequest：集成 Vant 默认 UI 反馈
 */
export function createH5Http(options: CreateH5HttpOptions = {}): HttpRequest {
  const {
    tokenKey = 'access_token',
    refreshTokenKey = 'refresh_token',
    tokenExpires = 1,
    refreshExpires = 7,
    tokenStorage,
    loginPath,
    onLogout,
    authDialog,
    errorDuration,
    redirectLogin,
    hooks: userHooks,
    enableLoading = true,
    loadingOptions,
    ...rest
  } = options

  const storage = tokenStorage ?? createTokenStorage({ tokenKey, refreshTokenKey, tokenExpires, refreshExpires })

  const presetHooks = createH5Hooks(storage, {
    loginPath,
    onLogout,
    authDialog,
    errorDuration,
    redirectLogin
  })

  return createHttp({
    ...rest,
    tokenProvider: storage,
    loading: enableLoading ? createVantLoadingHandler(loadingOptions) : undefined,
    hooks: { ...presetHooks, ...userHooks }
  })
}

export type { TokenStorage } from '@vue3-monorepo/shared/utils'
export type {
  RequestConfig,
  ResponseData,
  CreateHttpOptions,
  HttpRequest,
  RefreshTokenResult,
  NormalizedError,
  TokenProvider,
  RequestHooks,
  ErrorHookContext,
  LoadingHandler
} from '@vue3-monorepo/request-core'
