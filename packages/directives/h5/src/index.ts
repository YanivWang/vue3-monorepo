import type { App } from 'vue'
import { createPermissionDirective } from './permission'
import { createRoleDirective } from './role'
import { vLongpress } from './longpress'
import { vLazy } from './lazy'

export * from './permission'
export * from './role'
export * from './longpress'
export * from './lazy'
export * from './utils'

export interface RegisterDirectivesH5Options {
  hasPermission: (key: string) => boolean
  hasRole: (key: string) => boolean
  /** 是否注册 v-longpress，默认 true */
  longpress?: boolean
  /** 是否注册 v-lazy，默认 true */
  lazy?: boolean
  names?: {
    permission?: string
    role?: string
    longpress?: string
    lazy?: string
  }
}

/**
 * 批量注册 H5 自定义指令
 */
export function registerDirectives(app: App, options: RegisterDirectivesH5Options): void {
  const { hasPermission, hasRole, longpress = true, lazy = true, names = {} } = options
  app.directive(names.permission ?? 'permission', createPermissionDirective(hasPermission))
  app.directive(names.role ?? 'role', createRoleDirective(hasRole))
  if (longpress) app.directive(names.longpress ?? 'longpress', vLongpress)
  if (lazy) app.directive(names.lazy ?? 'lazy', vLazy)
}
