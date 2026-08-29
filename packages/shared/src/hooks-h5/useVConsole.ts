import { onBeforeUnmount } from 'vue'

export interface UseVConsoleOptions {
  /** 是否启用（默认只在 dev 下启用） */
  enabled?: boolean
  /** 自定义面板主题 */
  theme?: 'dark' | 'light'
  /** 插件与额外选项，透传到 VConsole 构造函数 */
  [k: string]: unknown
}

interface VConsoleInstance {
  destroy: () => void
}

interface VConsoleCtor {
  new (opts?: Record<string, unknown>): VConsoleInstance
}

let installed: VConsoleInstance | null = null

/**
 * 按需挂载 vconsole（`vconsole` 必须作为宿主应用的 devDependency）
 *
 * - 多次调用仅挂载一次（单例）
 * - 默认 dev 环境启用；生产需要显式 enabled: true
 * - 组件卸载时 **不会** 销毁（避免路由切换时 flash）
 */
export function useVConsole(options: UseVConsoleOptions = {}): { destroy: () => void } {
  const meta = import.meta as ImportMeta & { env?: { DEV?: boolean } }
  const { enabled = meta.env?.DEV === true, theme = 'dark', ...rest } = options

  if (!enabled || typeof window === 'undefined') {
    return { destroy: () => {} }
  }

  if (!installed) {
    import('vconsole')
      .then((mod) => {
        if (installed) return
        const VConsole = (mod.default ?? mod) as VConsoleCtor
        installed = new VConsole({ theme, ...rest })
      })
      .catch((err) => {
        console.warn('[useVConsole] failed to load vconsole:', err)
      })
  }

  function destroy(): void {
    installed?.destroy()
    installed = null
  }

  onBeforeUnmount(() => {
    // 默认不自动 destroy；若业务确需页面级销毁，使用返回值手动调用
  })

  return { destroy }
}
