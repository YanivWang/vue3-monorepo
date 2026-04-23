import type { App, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/modules/user'

function resolveKeys(value: DirectiveBinding['value']): string[] {
  if (value == null) {
    return []
  }
  if (Array.isArray(value)) {
    return value.filter((k): k is string => typeof k === 'string' && k.length > 0)
  }
  if (typeof value === 'string') {
    return [value]
  }
  return []
}

/**
 * 按权限显隐元素；需已登录且 Pinia 可用
 * 使用：v-permission="'admin'" 或 v-permission="['a','b']"（满足其一则显示）
 */
function check(el: HTMLElement, binding: DirectiveBinding) {
  const keys = resolveKeys(binding.value)
  if (keys.length === 0) {
    return
  }
  const userStore = useUserStore()
  const ok = keys.some(k => userStore.hasPermission(k))
  if (!ok) {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

const permission = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    check(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    check(el, binding)
  }
}

export function registerPermission(app: App) {
  app.directive('permission', permission)
}
