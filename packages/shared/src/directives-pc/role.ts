import type { Directive, DirectiveBinding } from 'vue'
import { resolveKeys } from './utils'

/**
 * 创建 v-role 指令
 *
 * @param checker 判断当前用户是否拥有指定角色
 * @returns Vue Directive，无角色时直接从 DOM 移除节点（v-if 语义）
 */
export function createRoleDirective(checker: (key: string) => boolean): Directive {
  return {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      const keys = resolveKeys(binding.value)
      if (keys.length === 0) return
      const ok = keys.some(k => checker(k))
      if (!ok) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}
