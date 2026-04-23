import type { App, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/modules/user'

function resolveKeys(value: DirectiveBinding['value']): string[] {
  if (value == null) return []
  if (Array.isArray(value)) return value.filter((k): k is string => typeof k === 'string' && k.length > 0)
  if (typeof value === 'string') return [value]
  return []
}

/**
 * v-permission 指令：无权限时直接移除 DOM 节点（v-if 语义，非 display:none）
 * 用法：v-permission="'admin'"  或  v-permission="['a','b']"（满足其一则保留）
 */
const permission = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const keys = resolveKeys(binding.value)
    if (keys.length === 0) return

    const userStore = useUserStore()
    const ok = keys.some(k => userStore.hasPermission(k))
    if (!ok) {
      // 移除节点而非 display:none，避免 DOM 安全隐患
      el.parentNode?.removeChild(el)
    }
  }
}

export function registerPermission(app: App) {
  app.directive('permission', permission)
}
