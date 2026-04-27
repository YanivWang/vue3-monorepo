import { createUsePermission } from '@vue3-monorepo/shared/hooks-core'
import { useUserStore } from '@/stores/modules/user'

/**
 * Admin 封装：从 user store 延迟读取 permissions / roles，避免在 Pinia 初始化前访问
 */
export const usePermission = createUsePermission({
  permissions: () => useUserStore().permissions,
  roles: () => useUserStore().roles,
  hasPermission: (key: string) => useUserStore().hasPermission(key),
  hasRole: (key: string) => useUserStore().hasRole(key)
})
