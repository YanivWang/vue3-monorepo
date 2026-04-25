import type { App } from 'vue'
import { createPermissionDirective } from './permission'
import { createRoleDirective } from './role'
import { createCopyDirective, type CopyDirectiveOptions } from './copy'

export * from './permission'
export * from './role'
export * from './copy'
export * from './utils'

export interface RegisterDirectivesOptions {
  /** 权限码判断函数：必填 */
  hasPermission: (key: string) => boolean
  /** 角色判断函数：必填 */
  hasRole: (key: string) => boolean
  /** v-copy 配置（不传则不注册 v-copy） */
  copy?: CopyDirectiveOptions | false
  /**
   * 可选：重命名指令前缀/名字
   */
  names?: {
    permission?: string
    role?: string
    copy?: string
  }
}

/**
 * 统一注册 PC 端自定义指令
 *
 * @example
 * registerDirectives(app, {
 *   hasPermission: (k) => useUserStore().hasPermission(k),
 *   hasRole: (k) => useUserStore().hasRole(k),
 *   copy: { onSuccess: () => ElMessage.success('已复制') },
 * })
 */
export function registerDirectives(app: App, options: RegisterDirectivesOptions): void {
  const { hasPermission, hasRole, copy, names = {} } = options
  app.directive(names.permission ?? 'permission', createPermissionDirective(hasPermission))
  app.directive(names.role ?? 'role', createRoleDirective(hasRole))
  if (copy !== false) {
    app.directive(names.copy ?? 'copy', createCopyDirective(copy || {}))
  }
}
