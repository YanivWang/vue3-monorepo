import { computed, ref } from 'vue'
import type { Ref } from 'vue'

/** 登录返回的基础负载，业务层可在 TLoginResult 中扩展 */
export interface AuthLoginResult {
  token: string
  refreshToken?: string
  [k: string]: unknown
}

/**
 * 注入上下文：
 * - loginStrategies：策略字典；key 为策略名（表单 / 微信授权 / APP SSO …），value 为异步登录函数
 * - getToken / setToken / clearToken：与运行时 Storage 解耦
 * - fetchProfile：登录成功后拉取用户资料（可选）
 * - onLoggedIn / onLoggedOut：侧效钩子（路由跳转、事件埋点等，由业务层传入）
 */
export interface AuthContext<
  TLoginParams extends Record<string, unknown> = Record<string, unknown>,
  TLoginResult extends AuthLoginResult = AuthLoginResult,
  TProfile = unknown
> {
  loginStrategies: Record<string, (params: TLoginParams) => Promise<TLoginResult>>
  getToken(): string | null | undefined
  setToken(token: string): void
  clearToken(): void
  fetchProfile?(): Promise<TProfile>
  onLoggedIn?(result: TLoginResult): void | Promise<void>
  onLoggedOut?(): void | Promise<void>
}

export interface UseAuthReturn<TLoginParams, TLoginResult, TProfile> {
  token: Ref<string | null>
  profile: Ref<TProfile | null>
  logged: Ref<boolean>
  loading: Ref<boolean>
  /**
   * 统一登录入口，按 strategy 派发到对应策略函数。
   * @throws 未找到策略 / 策略抛错时向上透传
   */
  login(strategy: string, params: TLoginParams): Promise<TLoginResult>
  /** 退出登录，清除 token 并触发 onLoggedOut */
  logout(): Promise<void>
  /** 手动刷新用户资料 */
  refreshProfile(): Promise<TProfile | null>
}

/**
 * 创建 useAuth composable：多登录策略 + 生命周期钩子，UI/存储 无关。
 *
 * @example
 *   // apps/h5/src/composables/useAuth.ts
 *   export const useAuth = createUseAuth({
 *     loginStrategies: {
 *       form: (p) => http.post('/auth/login', p),
 *       wxMini: async () => {
 *         const code = await bridge.auth.login()
 *         return http.post('/auth/wx', { code: code.token })
 *       },
 *     },
 *     getToken: () => tokenStorage.get(),
 *     setToken: (t) => tokenStorage.set(t),
 *     clearToken: () => tokenStorage.clear(),
 *     fetchProfile: () => http.get('/user/profile'),
 *     onLoggedIn: () => router.replace('/home'),
 *   })
 */
export function createUseAuth<
  TLoginParams extends Record<string, unknown> = Record<string, unknown>,
  TLoginResult extends AuthLoginResult = AuthLoginResult,
  TProfile = unknown
>(ctx: AuthContext<TLoginParams, TLoginResult, TProfile>) {
  const token = ref<string | null>(ctx.getToken() ?? null)
  const profile = ref<TProfile | null>(null) as Ref<TProfile | null>
  const loading = ref(false)

  async function login(strategy: string, params: TLoginParams): Promise<TLoginResult> {
    const fn = ctx.loginStrategies[strategy]
    if (!fn) throw new Error(`[useAuth] unknown login strategy: ${strategy}`)
    loading.value = true
    try {
      const result = await fn(params)
      ctx.setToken(result.token)
      token.value = result.token
      if (ctx.fetchProfile) {
        try {
          profile.value = await ctx.fetchProfile()
        } catch {
          // 拉取资料失败不影响登录成功态，业务层可单独重试
        }
      }
      await ctx.onLoggedIn?.(result)
      return result
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    ctx.clearToken()
    token.value = null
    profile.value = null
    await ctx.onLoggedOut?.()
  }

  async function refreshProfile(): Promise<TProfile | null> {
    if (!ctx.fetchProfile) return null
    profile.value = await ctx.fetchProfile()
    return profile.value
  }

  const logged = computed(() => !!token.value)

  return function useAuth(): UseAuthReturn<TLoginParams, TLoginResult, TProfile> {
    return { token, profile, logged, loading, login, logout, refreshProfile }
  }
}

export type UseAuthFactory = typeof createUseAuth
