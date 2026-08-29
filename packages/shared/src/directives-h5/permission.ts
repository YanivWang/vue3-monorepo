import type { Directive, DirectiveBinding } from 'vue'
import { resolveKeys } from './utils'

/**
 * H5 v-permission：无权限直接从 DOM 移除（v-if 语义）
 */
export function createPermissionDirective(checker: (key: string) => boolean): Directive {
  return {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      const keys = resolveKeys(binding.value)
      if (keys.length === 0) return
      const ok = keys.some((k) => checker(k))
      if (!ok) el.parentNode?.removeChild(el)
    },
  }
}
