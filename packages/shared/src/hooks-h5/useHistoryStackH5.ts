import { useRouter, type Router, type RouteLocationNormalized, type NavigationGuard } from 'vue-router'
import { useHistoryStack, type HistoryStackApi } from '@vue3-mono/shared/hooks-core'

export type HistoryNavAction = 'push' | 'replace' | 'pop'

export interface UseHistoryStackH5Options {
  /**
   * 自定义导航动作检测（高级）；`hint` 来自当前导航结束后的 History 打点（`pop`/`replace`/`push`），
   * 异常时回退为 `history.state.replaced`
   */
  detectNavigationAction?: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    hint: HistoryNavAction
  ) => HistoryNavAction
  autoBind?: boolean
  router?: Router
}

export interface UseHistoryStackH5Return extends HistoryStackApi {
  bind(router?: Router): () => void
}

/** 浏览器后退时由 popstate（捕获阶段）写入；与 vue-router 更新 URL 的时机对齐在 afterEach 消费 */
let pendingNavAction: HistoryNavAction | null = null
/** 与 history.state.position 对比，兜底识别后退（部分环境下 popstate 与 afterEach 顺序不稳定） */
let lastHistoryPosition: number | undefined
let instrumented = false
let popListener: (() => void) | null = null
const native = {
  pushState: null as typeof history.pushState | null,
  replaceState: null as typeof history.replaceState | null
}

/**
 * 安装全局 History 打点：记录 push / replace（用于调试）；后退仅依赖 popstate。
 * 须在 createRouter 之后、首次导航前调用一次（由 bind() 触发）
 */
function ensureHistoryInstrumentation(): void {
  if (typeof window === 'undefined' || instrumented) return
  instrumented = true
  native.pushState = history.pushState.bind(history)
  native.replaceState = history.replaceState.bind(history)

  history.pushState = function pushStatePatched(...args: Parameters<typeof history.pushState>) {
    pendingNavAction = 'push'
    return native.pushState!.apply(history, args)
  }
  history.replaceState = function replaceStatePatched(...args: Parameters<typeof history.replaceState>) {
    pendingNavAction = 'replace'
    return native.replaceState!.apply(history, args)
  }

  popListener = () => {
    pendingNavAction = 'pop'
  }
  window.addEventListener('popstate', popListener, true)
}

function readHistoryReplacedFlag(): boolean {
  if (typeof window === 'undefined') return false
  const s = window.history.state as { replaced?: boolean } | null
  return s != null && s.replaced === true
}

function readHistoryPosition(): number | undefined {
  if (typeof window === 'undefined') return undefined
  const s = window.history.state as { position?: number } | null
  const p = s?.position
  return typeof p === 'number' ? p : undefined
}

function hintFromPendingOrState(raw: HistoryNavAction | null): HistoryNavAction {
  if (raw === 'pop' || raw === 'replace' || raw === 'push') return raw
  return readHistoryReplacedFlag() ? 'replace' : 'push'
}

/** 栈顶即 from、且 to 在栈中位于 from 之下 → 视为后退（不依赖 History position / popstate 时序） */
function inferPopFromStack(stack: readonly { name: string }[], fromName: string, toName: string): boolean {
  if (!fromName || stack.length < 2) return false
  const top = stack[stack.length - 1]?.name
  const toIdx = stack.findIndex(s => s.name === toName)
  const fromIdx = stack.findIndex(s => s.name === fromName)
  return top === fromName && toIdx !== -1 && fromIdx !== -1 && toIdx < fromIdx
}

/**
 * H5 栈式 keep-alive：严格区分 push / replace / pop，与计划 §5.7 一致。
 *
 * 说明：Vue Router 4 在 **beforeEach 之后**才调用 `pushState`/`replaceState`，
 * 若在 beforeEach 里读 History 打点会混入「上一次导航」的残留，导致误判。
 * 因此非首屏的入栈/替换在 **afterEach** 中处理：此时 `finalizeNavigation` 已调用 History API，
 * `pendingNavAction` 对应当前导航（push 链路以最后一次 `pushState` 为准）；后退仍为 `popstate` 写入的 `pop`。
 *
 * - pop：栈裁剪到目标 `name`
 * - replace：替换栈顶项
 * - push：入栈（已存在则抬顶）
 */
export function useHistoryStackH5(options: UseHistoryStackH5Options = {}): UseHistoryStackH5Return {
  const stackApi = useHistoryStack()
  const { detectNavigationAction, autoBind = true } = options

  /** 仅首屏：from 无 name（START）时先入栈，避免与 afterEach 重复 */
  const guardInitial: NavigationGuard = (to, from) => {
    if (!to.name) return true
    if (!from.name) {
      stackApi.push({ name: String(to.name), fullPath: to.fullPath })
    }
    return true
  }

  function bind(router?: Router): () => void {
    const r = router ?? options.router ?? useRouter()
    ensureHistoryInstrumentation()

    const removeBefore = r.beforeEach(guardInitial)

    const removeAfter = r.afterEach((to, from, failure) => {
      if (failure || !to.name) return

      const rawPending = pendingNavAction

      if (!from.name) {
        pendingNavAction = null
        lastHistoryPosition = readHistoryPosition()
        return
      }

      pendingNavAction = null

      const name = String(to.name)
      const fullPath = to.fullPath
      const pos = readHistoryPosition()
      const looksLikeBack = lastHistoryPosition !== undefined && pos !== undefined && pos < lastHistoryPosition
      lastHistoryPosition = pos

      const fromName = from.name ? String(from.name) : ''
      // 先于 pending：后退后 scroll 等会 replaceState，把 pending 从 pop 覆盖成 replace，误触发栈顶 replace
      let defaultHint: HistoryNavAction = inferPopFromStack(stackApi.stack.value, fromName, name)
        ? 'pop'
        : hintFromPendingOrState(rawPending)
      if (defaultHint === 'push' && looksLikeBack) defaultHint = 'pop'
      const action = detectNavigationAction ? detectNavigationAction(to, from, defaultHint) : defaultHint

      if (action === 'pop') {
        stackApi.pop(name)
      } else if (action === 'replace') {
        stackApi.replace({ name, fullPath })
      } else {
        stackApi.push({ name, fullPath })
      }
    })

    return () => {
      removeBefore()
      removeAfter()
    }
  }

  if (autoBind) {
    try {
      bind()
    } catch {
      /* 非 setup 语境下 useRouter 不可用，由业务显式 bind */
    }
  }

  return { ...stackApi, bind }
}

/**
 * 撤销 History 打点并清空待消费动作（仅单测 / 特殊重置场景）
 */
export function __resetHistoryStackH5ForTests(): void {
  pendingNavAction = null
  lastHistoryPosition = undefined
  if (!instrumented) return
  if (typeof window !== 'undefined' && native.pushState && native.replaceState) {
    history.pushState = native.pushState
    history.replaceState = native.replaceState
    if (popListener) {
      window.removeEventListener('popstate', popListener, true)
      popListener = null
    }
  }
  native.pushState = null
  native.replaceState = null
  instrumented = false
}
