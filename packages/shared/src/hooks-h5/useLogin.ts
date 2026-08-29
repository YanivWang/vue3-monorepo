import { ref } from 'vue'
import type { Bridge } from '@vue3-monorepo/js-bridge'
import { H5Host } from '@vue3-monorepo/shared/enums'

export interface LoginFormParams {
  username: string
  password: string
  [k: string]: unknown
}

export interface LoginApi<TFormResult, TCodeResult> {
  /** 表单提交：用户名 / 密码；由业务层返回登录接口结果 */
  formLogin(params: LoginFormParams): Promise<TFormResult>
  /** 以小程序 / APP SSO 返回的 code / token 换业务 token */
  exchangeCode(code: string, host: H5Host): Promise<TCodeResult>
}

export interface UseLoginOptions<TFormResult, TCodeResult> {
  bridge: Bridge
  api: LoginApi<TFormResult, TCodeResult>
  /** 登录成功回调（统一跳转 / 存储） */
  onSuccess?: (payload: TFormResult | TCodeResult) => void | Promise<void>
  /** 登录失败回调 */
  onError?: (error: unknown) => void
}

export interface UseLoginReturn<TFormResult, TCodeResult> {
  loading: ReturnType<typeof ref<boolean>>
  /** 表单登录（所有宿主可用） */
  loginByForm(params: LoginFormParams): Promise<TFormResult>
  /** 通过 bridge.auth.login 获取 code / token 后换 token（微信小程序 / APP SSO 等） */
  loginByBridge(): Promise<TCodeResult>
  /**
   * 根据当前宿主自动选择策略：
   *   - browser → 必须传 formParams，走 loginByForm
   *   - wx-mini / ali-mini / native-app → 优先尝试 loginByBridge；失败回落到 loginByForm（若有 formParams）
   */
  loginAuto(formParams?: LoginFormParams): Promise<TFormResult | TCodeResult>
}

/**
 * H5 多宿主登录 composable。
 *
 * 设计要点：
 * - 严格依赖 bridge.auth 抽象，由 @vue3-monorepo/js-bridge 做宿主差异
 * - 表单登录与 SSO 完全解耦，业务层只需提供 formLogin/exchangeCode 两个 API
 * - loginAuto 提供"宿主优先 + 回落表单"的默认流程
 */
export function useLogin<TFormResult = unknown, TCodeResult = unknown>(
  options: UseLoginOptions<TFormResult, TCodeResult>,
): UseLoginReturn<TFormResult, TCodeResult> {
  const loading = ref(false)

  async function loginByForm(params: LoginFormParams): Promise<TFormResult> {
    loading.value = true
    try {
      const result = await options.api.formLogin(params)
      await options.onSuccess?.(result)
      return result
    } catch (e) {
      options.onError?.(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loginByBridge(): Promise<TCodeResult> {
    if (!options.bridge.hasAbility('auth.login')) {
      const err = new Error('[useLogin] 当前宿主不支持 bridge.auth.login')
      options.onError?.(err)
      throw err
    }
    loading.value = true
    try {
      const { credential } = await options.bridge.auth.login()
      const result = await options.api.exchangeCode(credential, options.bridge.host)
      await options.onSuccess?.(result)
      return result
    } catch (e) {
      options.onError?.(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loginAuto(formParams?: LoginFormParams): Promise<TFormResult | TCodeResult> {
    const host = options.bridge.host
    if (host === H5Host.BROWSER) {
      if (!formParams) throw new Error('[useLogin] browser 环境必须传 formParams')
      return loginByForm(formParams)
    }
    try {
      return await loginByBridge()
    } catch (e) {
      if (formParams) return loginByForm(formParams)
      throw e
    }
  }

  return { loading, loginByForm, loginByBridge, loginAuto }
}
