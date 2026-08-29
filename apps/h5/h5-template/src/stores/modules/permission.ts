import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * H5 端权限 store（简化版，不做动态路由，直接以可见菜单 + 权限码表驱动 UI）
 *
 * - 如业务需要"动态菜单接口 → 扁平化 → 守卫匹配"，参考 apps/pc/pc-admin-template/src/stores/modules/permission.ts
 * - 当前场景下 H5 页面数有限，固定声明于 router/routes.ts
 */
export const usePermissionStore = defineStore('h5-permission', () => {
  const visibleMenus = ref<string[]>([])
  const permissionCodes = ref<string[]>([])
  const ready = ref(false)

  function setPermissions(list: string[]): void {
    permissionCodes.value = list
  }

  function setVisibleMenus(list: string[]): void {
    visibleMenus.value = list
  }

  function markReady(): void {
    ready.value = true
  }

  function reset(): void {
    visibleMenus.value = []
    permissionCodes.value = []
    ready.value = false
  }

  return {
    visibleMenus,
    permissionCodes,
    ready,
    setPermissions,
    setVisibleMenus,
    markReady,
    reset,
  }
})
