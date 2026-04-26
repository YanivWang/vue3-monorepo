import { computed, onScopeDispose, ref, type Ref } from 'vue'

export interface UseCountdownReturn {
  /** 剩余秒数，0 表示未在倒计时 */
  remaining: Ref<number>
  /** 是否正在倒计时 */
  active: Ref<boolean>
  /** 开始一轮倒计时（会重置为 durationSeconds） */
  start: () => void
  /** 停止并清零 */
  stop: () => void
}

/**
 * 通用倒计时（短信验证码等），与 UI 无关。
 */
export function useCountdown(durationSeconds: number): UseCountdownReturn {
  const remaining = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  const active = computed(() => remaining.value > 0)

  function clearTimer() {
    if (timer != null) {
      clearInterval(timer)
      timer = null
    }
  }

  function stop() {
    clearTimer()
    remaining.value = 0
  }

  function start() {
    stop()
    remaining.value = Math.max(1, Math.floor(durationSeconds))
    timer = setInterval(() => {
      remaining.value -= 1
      if (remaining.value <= 0) stop()
    }, 1000)
  }

  onScopeDispose(stop)

  return { remaining, active, start, stop }
}
