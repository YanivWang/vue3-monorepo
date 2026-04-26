import type { App } from 'vue'
import { registerDirectives as registerH5Directives } from '@vue3-mono/shared/directives-h5'
import { useUserStore } from '@/stores'

/**
 * 注册 H5 指令（v-permission / v-role / v-longpress / v-lazy）
 *
 * hasPermission / hasRole 通过闭包从 pinia user store 读取，
 * 保证 token 刷新 / 登出后权限判断保持最新（pinia 内部是 reactive）
 */
export function registerDirectives(app: App): void {
  const user = useUserStore()
  registerH5Directives(app, {
    hasPermission: k => user.hasPermission(k),
    hasRole: k => user.hasRole(k)
  })
}
