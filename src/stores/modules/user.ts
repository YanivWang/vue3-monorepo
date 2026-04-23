import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo, login, logout as logoutApi } from '@/api/modules/user'
import { getToken, setToken, removeToken } from '@/utils/storage'
import type { UserInfo, LoginParams } from '@/types/api'

/**
 * 用户状态 Store
 * 使用 Setup Store 风格，具备完整 TypeScript 类型
 */
export const useUserStore = defineStore('user', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const token = ref<string>(getToken() ?? '')
  const userInfo = ref<UserInfo | null>(null)

  // ── Getters ──────────────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username ?? '')
  const nickname = computed(() => userInfo.value?.nickname ?? '')
  const avatar = computed(() => userInfo.value?.avatar ?? '')
  const roles = computed(() => userInfo.value?.roles ?? [])
  const permissions = computed(() => userInfo.value?.permissions ?? [])

  /** 判断是否拥有某权限 */
  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  /** 判断是否拥有某角色 */
  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  /** 登录 */
  async function loginAction(params: LoginParams): Promise<void> {
    const result = await login(params)
    token.value = result.accessToken
    setToken(result.accessToken)
  }

  /** 获取用户信息 */
  async function fetchUserInfo(): Promise<UserInfo> {
    const info = await getUserInfo()
    userInfo.value = info
    return info
  }

  /** 登出（调用接口 + 清理状态） */
  async function logoutAction(): Promise<void> {
    try {
      await logoutApi()
    } finally {
      resetState()
    }
  }

  /** 前端直接登出（不调接口，用于 token 失效场景） */
  function logout(): void {
    resetState()
  }

  /** 重置用户状态 */
  function resetState(): void {
    token.value = ''
    userInfo.value = null
    removeToken()
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    nickname,
    avatar,
    roles,
    permissions,
    hasPermission,
    hasRole,
    loginAction,
    fetchUserInfo,
    logoutAction,
    logout,
    resetState,
  }
})
