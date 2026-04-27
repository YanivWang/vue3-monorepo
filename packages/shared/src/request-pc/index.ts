import { createHttp, type CreateHttpOptions, type HttpRequest } from '@vue3-monorepo/shared/request-core'
import { createTokenStorage, type TokenStorage } from '@vue3-monorepo/shared/utils'
import { createElLoadingHandler } from './loading'
import { createPcHooks, type PcPresetOptions } from './preset'

export * from './preset'
export * from './loading'

export interface CreatePcHttpOptions
  extends Omit<CreateHttpOptions, 'tokenProvider' | 'loading' | 'hooks'>, PcPresetOptions {
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
  /** 自定义 Loading options（仅在 enableLoading=true 时生效） */
  loadingOptions?: Parameters<typeof createElLoadingHandler>[0]
}

/**
 * 创建 PC 端 HttpRequest：集成 Element Plus 默认 UI 反馈
 */
export function createPcHttp(options: CreatePcHttpOptions = {}): HttpRequest {
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
    hooks: userHooks,
    enableLoading = true,
    loadingOptions,
    ...rest
  } = options

  const storage = tokenStorage ?? createTokenStorage({ tokenKey, refreshTokenKey, tokenExpires, refreshExpires })

  const presetHooks = createPcHooks(storage, { loginPath, onLogout, authDialog, errorDuration })

  return createHttp({
    ...rest,
    tokenProvider: storage,
    loading: enableLoading ? createElLoadingHandler(loadingOptions) : undefined,
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
} from '@vue3-monorepo/shared/request-core'
