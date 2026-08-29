import { useBridge } from '@vue3-monorepo/js-bridge'
import { useLogin } from '@vue3-monorepo/shared/hooks-h5'
import { loginApi, type LoginFormParams, type LoginTokenResult, type SmsLoginParams } from '@/api/user'
import { useUserStore } from '@/stores'
import { router } from '@/router'

/**
 * H5 统一登录入口（结合 bridge + user store）
 *
 * 流程：
 *   1. useLogin.loginAuto() 根据宿主派发：
 *        - browser    → formLogin
 *        - wx-mini    → bridge.auth.login → exchangeCode
 *        - ali-mini   → bridge.auth.login → exchangeCode
 *        - native-app → bridge.auth.login → exchangeCode（失败回落 formLogin）
 *   2. 成功后：写 pinia token → 拉用户信息 → 跳 redirect
 *
 * 业务层仅需：
 *   const { loginAuto, loading } = useAuth()
 *   await loginAuto({ username, password })
 */
export function useAuth() {
  const bridge = useBridge()
  const user = useUserStore()

  async function applyLoginSuccess(payload: LoginTokenResult): Promise<void> {
    user.setAuth(payload.accessToken, payload.refreshToken)
    try {
      const info = await loginApi.getUserInfo()
      user.setUserInfo(info)
    } catch {
      /* 拉用户信息失败不阻塞登录成功体验 */
    }
    const redirect = router.currentRoute.value.query.redirect as string | undefined
    await router.replace(redirect || '/home')
  }

  const { loading, loginAuto, loginByForm, loginByBridge } = useLogin<LoginTokenResult, LoginTokenResult>({
    bridge,
    api: {
      formLogin: loginApi.formLogin,
      exchangeCode: (credential, host) => loginApi.exchangeCode(credential, host),
    },
    onSuccess: applyLoginSuccess,
  })

  async function logout() {
    try {
      await loginApi.logout()
    } catch {
      /* 即使接口失败也强制本地登出 */
    }
    try {
      await bridge.auth.logout()
    } catch {
      /* 浏览器宿主本身就没有 native 会话可登出 */
    }
    user.reset()
    await router.replace('/login')
  }

  async function loginAutoWithForm(params?: LoginFormParams): Promise<LoginTokenResult> {
    return loginAuto(params)
  }

  async function loginBySms(params: SmsLoginParams): Promise<LoginTokenResult> {
    loading.value = true
    try {
      const payload = await loginApi.smsLogin(params)
      await applyLoginSuccess(payload)
      return payload
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    loginAuto: loginAutoWithForm,
    loginByForm,
    loginByBridge,
    loginBySms,
    logout,
  }
}
