# @vue3-mono/bridge

多宿主抽象层：为 H5 在 **浏览器 / 微信小程序 WebView / 支付宝小程序 WebView / 原生 APP WebView** 四种宿主中提供统一 API。

## 设计

### 接口（P3.3 填充）

```ts
export type BridgeAbility = 'getToken' | 'share' | 'pay' | 'openMap' | 'scan' | 'storage' | 'navigation'

export interface Bridge {
  readonly host: BridgeHost
  isSupported(ability: BridgeAbility): boolean
  getToken(): Promise<string | null>
  share(opts: ShareOptions): Promise<void>
  pay(order: PayOrder): Promise<PayResult>
  // ...
}

export class BridgeError extends Error {
  constructor(
    readonly code: BridgeErrorCode,
    readonly ability: BridgeAbility,
    readonly host: BridgeHost,
    message: string
  ) {
    super(message)
  }
}
```

### 策略

- `strategies/base.ts`：默认失败实现工具集（`notSupported(ability, host)` 抛 `BridgeError`）
- `strategies/browser.ts`：浏览器实现（share 走 Web Share API，pay/getToken fallback 到 base）
- `strategies/wx-mini.ts`：微信小程序 WebView（wx.miniProgram.postMessage / my.postMessage）
- `strategies/ali-mini.ts`：支付宝小程序 WebView
- `strategies/native-app.ts`：iOS/Android APP WebView（JSBridge 或 WebViewJavascriptBridge）

### 工厂（懒加载）

```ts
export async function createBridge(host = detectHost()): Promise<Bridge> {
  switch (host) {
    case 'wx-mini':
      return (await import('./strategies/wx-mini')).default
    case 'ali-mini':
      return (await import('./strategies/ali-mini')).default
    case 'native-app':
      return (await import('./strategies/native-app')).default
    default:
      return (await import('./strategies/browser')).default
  }
}
```

## 构建

`unbuild` 产出 `esm only` + `.d.ts`（H5 场景无 CJS 消费需求）
