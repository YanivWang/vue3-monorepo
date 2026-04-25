import type { DirectiveBinding } from 'vue'

/** 解析 v-permission / v-role 的 binding.value → string[] */
export function resolveKeys(value: DirectiveBinding['value']): string[] {
  if (value == null) return []
  if (Array.isArray(value)) {
    return value.filter((k): k is string => typeof k === 'string' && k.length > 0)
  }
  if (typeof value === 'string') return [value]
  return []
}
