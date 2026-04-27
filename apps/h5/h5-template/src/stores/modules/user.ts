import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { UserInfo } from '@vue3-monorepo/shared/types'
import { getToken, setToken, removeToken, tokenStorage } from '@/utils/tokenStorage'

/**
 * H5 用户 store（与 admin 完全独立）
 *
 * - token 走 cookie 持久化（createTokenStorage）
 * - userInfo 放 memory，不做持久化
 * - fetchUserInfo / login / logout 的 API 调用在 P3-11 接入 @/api/user
 */
export const useUserStore = defineStore('h5-user', () => {
  const token = ref<string>(getToken() ?? '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username ?? '')
  const nickname = computed(() => userInfo.value?.nickname ?? '')
  const avatar = computed(() => userInfo.value?.avatar ?? '')
  const roles = computed(() => userInfo.value?.roles ?? [])
  const permissions = computed(() => userInfo.value?.permissions ?? [])

  function hasPermission(key: string): boolean {
    if (permissions.value.includes('*:*:*')) return true
    return permissions.value.includes(key)
  }

  function hasRole(key: string): boolean {
    return roles.value.includes(key)
  }

  function setAuth(accessToken: string, refreshToken?: string): void {
    token.value = accessToken
    setToken(accessToken)
    if (refreshToken) tokenStorage.setRefreshToken(refreshToken)
  }

  function setUserInfo(info: UserInfo | null): void {
    userInfo.value = info
  }

  function reset(): void {
    token.value = ''
    userInfo.value = null
    removeToken()
    tokenStorage.removeRefreshToken()
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
    setAuth,
    setUserInfo,
    reset
  }
})
