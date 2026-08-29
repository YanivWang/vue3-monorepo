import type { Directive, DirectiveBinding } from 'vue'

interface CopyEl extends HTMLElement {
  __copyHandler__?: (event: Event) => void
  __copyValue__?: string
}

/** 通用 Clipboard 写入，优先 navigator.clipboard，回退 execCommand */
async function writeClipboard(value: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      /* fallthrough */
    }
  }
  if (typeof document === 'undefined') return
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
}

export interface CopyDirectiveOptions {
  /** 复制成功回调（可用于 toast） */
  onSuccess?: (value: string) => void
  /** 复制失败回调 */
  onError?: (err: unknown) => void
}

/**
 * 创建 v-copy 指令：点击触发文本复制（binding.value 为要复制的内容）
 */
export function createCopyDirective(options: CopyDirectiveOptions = {}): Directive {
  const { onSuccess, onError } = options
  return {
    mounted(el: CopyEl, binding: DirectiveBinding<string>) {
      el.__copyValue__ = binding.value ?? ''
      // 复制本身是异步的，但事件监听器必须同步返回 void：
      // 直接把 async 函数当 listener 会让异常无处可去（no-misused-promises）
      const copy = async () => {
        const value = el.__copyValue__ ?? ''
        if (!value) return
        try {
          await writeClipboard(value)
          onSuccess?.(value)
        } catch (err) {
          onError?.(err)
        }
      }
      el.__copyHandler__ = () => {
        void copy()
      }
      el.addEventListener('click', el.__copyHandler__)
    },
    updated(el: CopyEl, binding: DirectiveBinding<string>) {
      el.__copyValue__ = binding.value ?? ''
    },
    beforeUnmount(el: CopyEl) {
      if (el.__copyHandler__) {
        el.removeEventListener('click', el.__copyHandler__)
        el.__copyHandler__ = undefined
      }
      el.__copyValue__ = undefined
    },
  }
}
