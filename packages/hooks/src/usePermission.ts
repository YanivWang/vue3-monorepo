import { computed, type ComputedRef, type Ref } from 'vue'

export interface PermissionContext {
  /** 当前用户的权限 code 列表 */
  permissions: Ref<string[]> | ComputedRef<string[]> | (() => string[])
  /** 当前用户的角色列表 */
  roles: Ref<string[]> | ComputedRef<string[]> | (() => string[])
  /** 是否具备权限码（可在业务层自定义策略，如通配符、`*` 超级管理员） */
  hasPermission?: (permission: string) => boolean
  /** 是否具备角色（默认为直接 includes） */
  hasRole?: (role: string) => boolean
}

function unwrap<T>(source: Ref<T> | ComputedRef<T> | (() => T)): T {
  if (typeof source === 'function') return (source as () => T)()
  return (source as Ref<T>).value
}

/**
 * 创建一个 `usePermission` composable，由业务层（Pinia store / 其他 state）注入权限上下文。
 *
 * @example
 * // apps/admin/src/composables/usePermission.ts
 * import { useUserStore } from '@/stores/modules/user'
 * import { createUsePermission } from '@vue3-mono/hooks'
 *
 * export const usePermission = createUsePermission({
 *   permissions: () => useUserStore().permissions,
 *   roles: () => useUserStore().roles,
 *   hasPermission: (p) => useUserStore().hasPermission(p),
 *   hasRole: (r) => useUserStore().hasRole(r),
 * })
 */
export function createUsePermission(ctx: PermissionContext) {
  return function usePermission() {
    const hasPermissionFn = ctx.hasPermission ?? ((p: string) => unwrap(ctx.permissions).includes(p))
    const hasRoleFn = ctx.hasRole ?? ((r: string) => unwrap(ctx.roles).includes(r))

    function hasPermission(permission: string | string[]): boolean {
      const keys = Array.isArray(permission) ? permission : [permission]
      return keys.some(k => hasPermissionFn(k))
    }
    function hasAllPermissions(permissions: string[]): boolean {
      return permissions.every(p => hasPermissionFn(p))
    }
    function hasRole(role: string | string[]): boolean {
      const keys = Array.isArray(role) ? role : [role]
      return keys.some(k => hasRoleFn(k))
    }
    function hasAllRoles(roles: string[]): boolean {
      return roles.every(r => hasRoleFn(r))
    }

    return {
      permissions: computed(() => unwrap(ctx.permissions)),
      roles: computed(() => unwrap(ctx.roles)),
      hasPermission,
      hasAllPermissions,
      hasRole,
      hasAllRoles
    }
  }
}

export type UsePermissionReturn = ReturnType<ReturnType<typeof createUsePermission>>
