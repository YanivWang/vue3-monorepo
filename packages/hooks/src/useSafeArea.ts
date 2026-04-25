import { onBeforeUnmount, onMounted, reactive, readonly } from 'vue'

export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * 安全区读取（iOS Notch / 底部 Home Indicator）。
 *
 * 实现要点：
 * - 依赖 `env(safe-area-inset-*)`；需业务方在 `<meta name="viewport" content="viewport-fit=cover">` 场景下使用
 * - 通过向 DOM 挂载一个不可见 probe 元素读取 computed style，而非依赖 window.visualViewport
 * - 监听 `resize` / `orientationchange`，横竖屏切换后同步
 * - 非浏览器环境直接返回 0，由业务层在 UI 上做兜底
 */
export function useSafeArea(): Readonly<SafeAreaInsets> {
  const insets = reactive<SafeAreaInsets>({ top: 0, right: 0, bottom: 0, left: 0 })

  let probe: HTMLDivElement | null = null
  const onResize = () => readProbe()

  function readProbe(): void {
    if (!probe) return
    const style = getComputedStyle(probe)
    insets.top = parseInt(style.paddingTop || '0', 10) || 0
    insets.right = parseInt(style.paddingRight || '0', 10) || 0
    insets.bottom = parseInt(style.paddingBottom || '0', 10) || 0
    insets.left = parseInt(style.paddingLeft || '0', 10) || 0
  }

  onMounted(() => {
    if (typeof document === 'undefined') return
    probe = document.createElement('div')
    probe.style.position = 'fixed'
    probe.style.top = '0'
    probe.style.left = '0'
    probe.style.width = '0'
    probe.style.height = '0'
    probe.style.pointerEvents = 'none'
    probe.style.visibility = 'hidden'
    probe.style.paddingTop = 'env(safe-area-inset-top)'
    probe.style.paddingRight = 'env(safe-area-inset-right)'
    probe.style.paddingBottom = 'env(safe-area-inset-bottom)'
    probe.style.paddingLeft = 'env(safe-area-inset-left)'
    document.body.appendChild(probe)
    readProbe()
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('orientationchange', onResize, { passive: true })
  })

  onBeforeUnmount(() => {
    if (probe?.parentNode) probe.parentNode.removeChild(probe)
    probe = null
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  })

  return readonly(insets)
}
