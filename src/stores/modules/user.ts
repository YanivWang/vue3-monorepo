import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo, login, logout as logoutApi } from '@/api/modules/user'
import { getToken, setToken, removeToken, setRefreshToken, removeRefreshToken } from '@/utils/storage'
import { resetRouter } from '@/router'
import { usePermissionStore } from '@/stores/modules/permission'
import { useTabsStore } from '@/stores/modules/tabs'
import type { UserInfo, LoginParams } from '@/types/api'

/**
 * 用户状态 Store
 * 使用 Setup Store 风格，具备完整 TypeScript 类型
 */
export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() ?? '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username ?? '')
  const nickname = computed(() => userInfo.value?.nickname ?? '')
  const avatar = computed(() => userInfo.value?.avatar ?? '')
  const roles = computed(() => userInfo.value?.roles ?? [])
  const permissions = computed(() => userInfo.value?.permissions ?? [])

  function hasPermission(permission: string): boolean {
    // *:*:* 表示超级管理员，拥有所有权限，直接放行
    if (permissions.value.includes('*:*:*')) return true
    return permissions.value.includes(permission)
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  async function loginAction(params: LoginParams): Promise<void> {
    const result = await login(params)
    token.value = result.accessToken
    setToken(result.accessToken)
    if (result.refreshToken) {
      setRefreshToken(result.refreshToken)
    }
  }

  async function fetchUserInfo(): Promise<UserInfo> {
    const info = await getUserInfo()
    userInfo.value = info
    return info
  }

  async function logoutAction(): Promise<void> {
    try {
      await logoutApi()
    } finally {
      resetState()
    }
  }

  function logout(): void {
    resetState()
  }

  function resetState(): void {
    token.value = ''
    userInfo.value = null
    removeToken()
    removeRefreshToken()
    // 重置动态路由（避免下一个账号登录残留路由）
    resetRouter()
    usePermissionStore().resetRoutes()
    useTabsStore().resetTabs()
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
    resetState
  }
})
