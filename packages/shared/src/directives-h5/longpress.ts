import type { Directive, DirectiveBinding } from 'vue'

export interface LongpressBindingValue {
  handler: (event: TouchEvent | MouseEvent) => void
  /** 长按触发阈值（ms），默认 500 */
  duration?: number
  /** 抖动距离阈值（px），默认 10；手指移动超出范围取消 */
  moveThreshold?: number
}

type Payload = LongpressBindingValue | ((e: TouchEvent | MouseEvent) => void)

interface Store {
  timer: number | null
  startX: number
  startY: number
  duration: number
  moveThreshold: number
  handler: (e: TouchEvent | MouseEvent) => void
  onStart: (e: TouchEvent | MouseEvent) => void
  onMove: (e: TouchEvent | MouseEvent) => void
  onEnd: () => void
}

const store = new WeakMap<HTMLElement, Store>()

function getPoint(e: TouchEvent | MouseEvent): { x: number; y: number } {
  if ('touches' in e && e.touches.length > 0) {
    const t = e.touches[0]!
    return { x: t.clientX, y: t.clientY }
  }
  const me = e as MouseEvent
  return { x: me.clientX, y: me.clientY }
}

/**
 * v-longpress：移动端长按
 *
 * @example
 *   <div v-longpress="onPress">按住</div>
 *   <div v-longpress="{ handler: onPress, duration: 800 }">按住 0.8s</div>
 */
export const vLongpress: Directive<HTMLElement, Payload> = {
  mounted(el, binding: DirectiveBinding<Payload>) {
    const value = binding.value
    const handler = typeof value === 'function' ? value : value.handler
    const duration = typeof value === 'function' ? 500 : (value.duration ?? 500)
    const moveThreshold = typeof value === 'function' ? 10 : (value.moveThreshold ?? 10)

    const s: Store = {
      timer: null,
      startX: 0,
      startY: 0,
      duration,
      moveThreshold,
      handler,
      onStart(e) {
        const p = getPoint(e)
        s.startX = p.x
        s.startY = p.y
        if (s.timer) window.clearTimeout(s.timer)
        s.timer = window.setTimeout(() => s.handler(e), s.duration)
      },
      onMove(e) {
        const p = getPoint(e)
        if (Math.abs(p.x - s.startX) > s.moveThreshold || Math.abs(p.y - s.startY) > s.moveThreshold) {
          if (s.timer) {
            window.clearTimeout(s.timer)
            s.timer = null
          }
        }
      },
      onEnd() {
        if (s.timer) {
          window.clearTimeout(s.timer)
          s.timer = null
        }
      },
    }
    store.set(el, s)

    el.addEventListener('touchstart', s.onStart, { passive: true })
    el.addEventListener('touchmove', s.onMove, { passive: true })
    el.addEventListener('touchend', s.onEnd)
    el.addEventListener('touchcancel', s.onEnd)
    el.addEventListener('mousedown', s.onStart)
    el.addEventListener('mousemove', s.onMove)
    el.addEventListener('mouseup', s.onEnd)
    el.addEventListener('mouseleave', s.onEnd)
  },
  unmounted(el) {
    const s = store.get(el)
    if (!s) return
    el.removeEventListener('touchstart', s.onStart)
    el.removeEventListener('touchmove', s.onMove)
    el.removeEventListener('touchend', s.onEnd)
    el.removeEventListener('touchcancel', s.onEnd)
    el.removeEventListener('mousedown', s.onStart)
    el.removeEventListener('mousemove', s.onMove)
    el.removeEventListener('mouseup', s.onEnd)
    el.removeEventListener('mouseleave', s.onEnd)
    if (s.timer) window.clearTimeout(s.timer)
    store.delete(el)
  },
}
