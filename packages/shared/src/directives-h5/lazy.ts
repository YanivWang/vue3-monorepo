import type { Directive, DirectiveBinding } from 'vue'

export interface LazyBindingValue {
  /** 图片真实地址 */
  src: string
  /** 加载中占位 */
  placeholder?: string
  /** 加载失败占位 */
  error?: string
  /** IntersectionObserver rootMargin */
  rootMargin?: string
}

type Payload = LazyBindingValue | string

interface Store {
  observer: IntersectionObserver | null
  src: string
  placeholder: string
  error: string
  loaded: boolean
  onError: () => void
}

const store = new WeakMap<HTMLImageElement, Store>()

function applyPayload(binding: DirectiveBinding<Payload>): LazyBindingValue {
  const val = binding.value
  if (typeof val === 'string') return { src: val }
  return val
}

/**
 * v-lazy：基于 IntersectionObserver 的图片懒加载
 *
 * @example
 *   <img v-lazy="imgUrl" />
 *   <img v-lazy="{ src, placeholder: '/ph.png', error: '/404.png' }" />
 */
export const vLazy: Directive<HTMLImageElement, Payload> = {
  mounted(el, binding: DirectiveBinding<Payload>) {
    const opts = applyPayload(binding)
    const placeholder =
      opts.placeholder ??
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="%23eee" width="1" height="1"/></svg>'
    const errorUrl = opts.error ?? placeholder

    const s: Store = {
      observer: null,
      src: opts.src,
      placeholder,
      error: errorUrl,
      loaded: false,
      onError() {
        el.src = s.error
      },
    }

    el.src = s.placeholder
    el.addEventListener('error', s.onError)
    store.set(el, s)

    if (typeof IntersectionObserver === 'undefined') {
      el.src = s.src
      s.loaded = true
      return
    }

    s.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !s.loaded) {
            el.src = s.src
            s.loaded = true
            s.observer?.disconnect()
            s.observer = null
          }
        }
      },
      { rootMargin: opts.rootMargin ?? '50px' },
    )
    s.observer.observe(el)
  },
  updated(el, binding: DirectiveBinding<Payload>) {
    const s = store.get(el)
    if (!s) return
    const opts = applyPayload(binding)
    if (opts.src && opts.src !== s.src) {
      s.src = opts.src
      s.loaded = false
      el.src = s.placeholder
      if (s.observer) s.observer.disconnect()
      s.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !s.loaded) {
              el.src = s.src
              s.loaded = true
              s.observer?.disconnect()
              s.observer = null
            }
          }
        },
        { rootMargin: opts.rootMargin ?? '50px' },
      )
      s.observer.observe(el)
    }
  },
  unmounted(el) {
    const s = store.get(el)
    if (!s) return
    s.observer?.disconnect()
    el.removeEventListener('error', s.onError)
    store.delete(el)
  },
}
