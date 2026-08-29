import type { Directive, DirectiveBinding } from 'vue'
import { resolveKeys } from './utils'

/**
 * H5 v-role：未命中角色时移除节点
 */
export function createRoleDirective(checker: (key: string) => boolean): Directive {
  return {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      const keys = resolveKeys(binding.value)
      if (keys.length === 0) return
      const ok = keys.some((k) => checker(k))
      if (!ok) el.parentNode?.removeChild(el)
    },
  }
}
