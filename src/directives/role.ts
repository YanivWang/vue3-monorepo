import type { DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/modules/user'

function resolveKeys(value: DirectiveBinding['value']): string[] {
  if (value == null) return []
  if (Array.isArray(value)) return value.filter((k): k is string => typeof k === 'string' && k.length > 0)
  if (typeof value === 'string') return [value]
  return []
}

/**
 * v-role 指令：无对应角色时直接移除 DOM 节点（v-if 语义）
 * 用法：v-role="'admin'"  或  v-role="['admin','editor']"（满足其一则保留）
 */
export const role = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const keys = resolveKeys(binding.value)
    if (keys.length === 0) return

    const userStore = useUserStore()
    const ok = keys.some(k => userStore.hasRole(k))
    if (!ok) {
      el.parentNode?.removeChild(el)
    }
  }
}
