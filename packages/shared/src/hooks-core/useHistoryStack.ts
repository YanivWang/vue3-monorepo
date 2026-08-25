import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

/**
 * 路由栈记录单元。
 * - name：路由命名（推荐与 vue-router 的 `name` 一致）
 * - fullPath：带参数路径，用作 keep-alive key 稳定
 * - ts：入栈时间戳（LRU 淘汰参考）
 */
export interface HistoryStackItem {
  name: string
  fullPath: string
  ts: number
}

export interface UseHistoryStackOptions {
  /** 最大保留层数（超出 LRU 淘汰），默认 20 */
  max?: number
}

export interface HistoryStackApi {
  /** 当前所有栈项（响应式） */
  stack: Ref<HistoryStackItem[]>
  /** 对应 keep-alive include 的 name 数组（去重） */
  include: ComputedRef<string[]>
  /** push：入栈（已存在则抬到栈顶） */
  push(item: Omit<HistoryStackItem, 'ts'>): void
  /** pop：弹栈到指定 name（用于 back 语义），默认弹出栈顶 */
  pop(toName?: string): void
  /** 替换栈顶（router.replace 场景） */
  replace(item: Omit<HistoryStackItem, 'ts'>): void
  /** 根据路由 name 判断是否已在栈中 */
  has(name: string): boolean
  /** 清空 */
  clear(): void
}

let singleton: HistoryStackApi | null = null

/**
 * 栈式 keep-alive 基础设施（UI 无关，H5/PC 复用）
 *
 * - 默认导出一个 **进程内单例**，以保证 router.beforeEach 与 <RouterView> 间共享状态
 * - 业务层只需：
 *     · 路由守卫里调用 push / pop / replace
 *     · <KeepAlive :include="include"> 绑定 `include`
 *     · keep-alive 组件 `name` 必须和 `item.name` 一致
 *
 * @example
 *   const { include, push, pop } = useHistoryStack()
 *   router.beforeEach((to, from) => {
 *     if (isBack(to, from)) pop(to.name)
 *     else push({ name: to.name, fullPath: to.fullPath })
 *   })
 */
export function useHistoryStack(options: UseHistoryStackOptions = {}): HistoryStackApi {
  if (singleton) return singleton
  const { max = 20 } = options

  const stack = ref<HistoryStackItem[]>([])
  const include = computed(() => Array.from(new Set(stack.value.map(s => s.name))))

  function push(item: Omit<HistoryStackItem, 'ts'>): void {
    const existIdx = stack.value.findIndex(s => s.name === item.name)
    if (existIdx !== -1) {
      const exist = stack.value.splice(existIdx, 1)[0]!
      stack.value.push({ ...exist, fullPath: item.fullPath, ts: Date.now() })
    } else {
      stack.value.push({ ...item, ts: Date.now() })
      if (stack.value.length > max) stack.value.shift()
    }
  }

  function pop(toName?: string): void {
    if (!toName) {
      stack.value.pop()
      return
    }
    const idx = stack.value.findIndex(s => s.name === toName)
    if (idx === -1) return
    stack.value.splice(idx + 1)
  }

  function replace(item: Omit<HistoryStackItem, 'ts'>): void {
    if (stack.value.length === 0) {
      push(item)
      return
    }
    stack.value[stack.value.length - 1] = { ...item, ts: Date.now() }
  }

  function has(name: string): boolean {
    return stack.value.some(s => s.name === name)
  }

  function clear(): void {
    stack.value = []
  }

  singleton = { stack, include, push, pop, replace, has, clear }
  return singleton
}

/** 测试 / 登出重置单例 */
export function __resetHistoryStack(): void {
  singleton = null
}
