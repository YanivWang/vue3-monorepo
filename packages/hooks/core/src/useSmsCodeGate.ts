import { useCountdown } from './useCountdown'

export interface UseSmsCodeGateReturn extends ReturnType<typeof useCountdown> {
  /**
   * 发送验证码：冷却期内返回 false；成功后自动开始倒计时
   */
  runSend: (send: () => Promise<void>) => Promise<boolean>
}

/**
 * 短信验证码发送节流（依赖 useCountdown），与具体 UI / 请求实现解耦。
 */
export function useSmsCodeGate(durationSeconds = 60): UseSmsCodeGateReturn {
  const cd = useCountdown(durationSeconds)

  async function runSend(send: () => Promise<void>): Promise<boolean> {
    if (cd.remaining.value > 0) return false
    await send()
    cd.start()
    return true
  }

  return { ...cd, runSend }
}
