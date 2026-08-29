import { H5Host, detectHost } from './host'
import type { Bridge, BridgeAbility, BridgeStrategy } from './types'
import { createBrowserStrategy } from './strategies/browser'
import { createWxMiniStrategy, type WxMiniStrategyOptions } from './strategies/wx-mini'
import { createAlipayMiniStrategy, type AlipayMiniStrategyOptions } from './strategies/ali-mini'
import { createNativeAppStrategy, type NativeAppStrategyOptions } from './strategies/native-app'

export * from './types'
export * from './host'
export * from './strategies/base'
export { createBrowserStrategy } from './strategies/browser'
export { createWxMiniStrategy } from './strategies/wx-mini'
export { createAlipayMiniStrategy } from './strategies/ali-mini'
export { createNativeAppStrategy } from './strategies/native-app'

export interface CreateBridgeOptions {
  /** 强制指定宿主；默认通过 detectHost() 自动识别 */
  host?: H5Host
  wxMini?: WxMiniStrategyOptions
  alipayMini?: AlipayMiniStrategyOptions
  nativeApp?: NativeAppStrategyOptions
  /** 注入自定义策略（用于测试或扩展新宿主） */
  strategy?: BridgeStrategy
}

/**
 * 根据当前宿主（或选项强制）创建 Bridge 单例。
 *
 * @example
 *   import { createBridge } from '@vue3-monorepo/js-bridge'
 *   const bridge = createBridge({ wxMini: { loginPath: '/pages/login' } })
 *   await bridge.ui.toast({ message: 'hi' })
 *   const { credential } = await bridge.auth.login()
 */
export function createBridge(options: CreateBridgeOptions = {}): Bridge {
  const host = options.host ?? detectHost()

  const strategy =
    options.strategy ??
    (host === H5Host.WECHAT_MINI
      ? createWxMiniStrategy(options.wxMini)
      : host === H5Host.ALIPAY_MINI
        ? createAlipayMiniStrategy(options.alipayMini)
        : host === H5Host.NATIVE_APP
          ? createNativeAppStrategy(options.nativeApp)
          : createBrowserStrategy())

  return {
    host: strategy.host,
    hasAbility(ability: BridgeAbility) {
      return strategy.abilities.has(ability)
    },
    navigation: strategy.navigation,
    storage: strategy.storage,
    auth: strategy.auth,
    ui: strategy.ui,
    event: strategy.event,
    payment: strategy.payment,
    device: strategy.device,
    clipboard: strategy.clipboard,
  }
}

/** 进程内单例（按需复用，无需手动管理生命周期） */
let _bridge: Bridge | null = null
export function useBridge(options?: CreateBridgeOptions): Bridge {
  if (!_bridge) _bridge = createBridge(options)
  return _bridge
}

/** 测试 / 动态切换宿主场景下重置单例 */
export function __resetBridge(): void {
  _bridge = null
}
