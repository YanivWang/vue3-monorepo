import { loginApi } from '@/api/user'
import { useUserStore } from '@/stores'
import { getToken } from '@/utils/tokenStorage'

/**
 * 刷新后 Pinia 仅有 Cookie 中的 token，`userInfo` 需重新拉取。
 * 与登录成功后的拉取逻辑对齐；失败不阻塞首屏。
 */
export async function bootstrapUserInfo(): Promise<void> {
  const user = useUserStore()
  if (!getToken() || user.userInfo) return
  try {
    const info = await loginApi.getUserInfo()
    user.setUserInfo(info)
  } catch {
    /* 与 useAuth.applyLoginSuccess 一致，拉取失败不阻塞应用启动 */
  }
}
