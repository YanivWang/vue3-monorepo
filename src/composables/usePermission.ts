import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'

/**
 * 权限判断 Composable
 * 提供基于权限码和角色的细粒度控制
 */
export function usePermission() {
  const userStore = useUserStore()

  /** 是否具备指定权限码（满足其一即可） */
  function hasPermission(permission: string | string[]): boolean {
    const keys = Array.isArray(permission) ? permission : [permission]
    return keys.some(k => userStore.hasPermission(k))
  }

  /** 是否具备全部权限码 */
  function hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => userStore.hasPermission(p))
  }

  /** 是否具备指定角色（满足其一即可） */
  function hasRole(role: string | string[]): boolean {
    const keys = Array.isArray(role) ? role : [role]
    return keys.some(k => userStore.hasRole(k))
  }

  /** 是否具备全部角色 */
  function hasAllRoles(roles: string[]): boolean {
    return roles.every(r => userStore.hasRole(r))
  }

  return {
    permissions: computed(() => userStore.permissions),
    roles: computed(() => userStore.roles),
    hasPermission,
    hasAllPermissions,
    hasRole,
    hasAllRoles
  }
}
