import type { H5Host } from '@vue3-mono/shared/enums'

/**
 * 多宿主桥接能力枚举 —— 用于 bridge.hasAbility() 能力嗅探
 */
export type BridgeAbility =
  | 'navigation.back'
  | 'navigation.close'
  | 'navigation.openExternal'
  | 'navigation.setTitle'
  | 'storage.get'
  | 'storage.set'
  | 'storage.remove'
  | 'auth.login'
  | 'auth.getUserProfile'
  | 'auth.logout'
  | 'ui.toast'
  | 'ui.loading'
  | 'ui.hideLoading'
  | 'ui.chooseImage'
  | 'ui.previewImage'
  | 'ui.scanCode'
  | 'ui.vibrate'
  | 'event.on'
  | 'event.off'
  | 'event.emit'
  | 'payment.pay'
  | 'device.getInfo'
  | 'device.getLocation'
  | 'clipboard.write'
  | 'clipboard.read'

export interface BridgeErrorOptions {
  /** 桥方法名，如 'auth.login' */
  method: string
  /** 宿主类型 */
  host: H5Host
  /** 错误码（宿主返回 或 桥内部定义） */
  code?: string | number
  /** 原始错误对象（宿主 SDK 抛出时透传） */
  cause?: unknown
}

/**
 * 桥接错误统一类型。
 *
 * 设计目的：
 * - 业务层 catch 时可拿到 method/host/code 三维信息
 * - 宿主 SDK 抛出的原生对象经 cause 透传，不丢失信息
 */
export class BridgeError extends Error {
  method: string
  host: H5Host
  code?: string | number
  cause?: unknown

  constructor(message: string, opts: BridgeErrorOptions) {
    super(message)
    this.name = 'BridgeError'
    this.method = opts.method
    this.host = opts.host
    this.code = opts.code
    this.cause = opts.cause
  }
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export interface BridgeNavigation {
  /** 后退（浏览器 history.back；WebView 回调 native） */
  back(delta?: number): Promise<void>
  /** 关闭当前 WebView（浏览器为 window.close，安全限制通常失败） */
  close(): Promise<void>
  /** 以外部浏览器方式打开 URL（小程序 web-view 场景 = location.href） */
  openExternal(url: string): Promise<void>
  /** 设置导航栏标题（浏览器设置 document.title） */
  setTitle(title: string): Promise<void>
}

// ─── Storage ────────────────────────────────────────────────────────────────

export interface BridgeStorage {
  get<T = unknown>(key: string): Promise<T | null>
  set(key: string, value: unknown): Promise<void>
  remove(key: string): Promise<void>
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface BridgeLoginParams {
  /** 扫码 / 密码 / 小程序 code / native SSO token 等，上层业务可透传 */
  [key: string]: unknown
}

export interface BridgeLoginResult {
  /** 宿主侧颁发的凭证：小程序 code / native token 等，业务侧用其换服务端 token */
  credential: string
  /** 宿主 openid（小程序）、unionid 或 native userId，视宿主不同可能缺省 */
  openId?: string
  /** 宿主原始返回，便于扩展使用 */
  raw?: unknown
}

export interface BridgeUserProfile {
  nickname?: string
  avatar?: string
  [key: string]: unknown
}

export interface BridgeAuth {
  /** 触发宿主原生登录（浏览器下抛出 BridgeError 要求表单登录兜底） */
  login(params?: BridgeLoginParams): Promise<BridgeLoginResult>
  /** 请求用户资料（微信 getUserProfile / App 原生） */
  getUserProfile(): Promise<BridgeUserProfile>
  /** 通知宿主退出登录（清理 native 会话） */
  logout(): Promise<void>
}

// ─── UI ─────────────────────────────────────────────────────────────────────

export interface BridgeToastOptions {
  message: string
  duration?: number
  icon?: 'success' | 'fail' | 'loading' | 'none'
}

export interface BridgeChooseImageOptions {
  count?: number
  sourceType?: Array<'album' | 'camera'>
  sizeType?: Array<'original' | 'compressed'>
}

export interface BridgeChooseImageResult {
  tempFilePaths: string[]
  tempFiles?: Array<{ path: string; size: number }>
}

export interface BridgePreviewImageOptions {
  urls: string[]
  current?: string | number
}

export interface BridgeUI {
  toast(opts: BridgeToastOptions): Promise<void>
  loading(title?: string): Promise<void>
  hideLoading(): Promise<void>
  chooseImage(opts?: BridgeChooseImageOptions): Promise<BridgeChooseImageResult>
  previewImage(opts: BridgePreviewImageOptions): Promise<void>
  scanCode(): Promise<{ result: string }>
  vibrate(short?: boolean): Promise<void>
}

// ─── Event ──────────────────────────────────────────────────────────────────

export type BridgeEventHandler<T = unknown> = (payload: T) => void

export interface BridgeEvent {
  on<T = unknown>(event: string, handler: BridgeEventHandler<T>): void
  off<T = unknown>(event: string, handler?: BridgeEventHandler<T>): void
  emit<T = unknown>(event: string, payload?: T): void
}

// ─── Payment / Device / Clipboard ──────────────────────────────────────────

export interface BridgePaymentParams {
  orderId: string
  amount: number
  [key: string]: unknown
}

export interface BridgePayment {
  pay(params: BridgePaymentParams): Promise<{ success: boolean; raw?: unknown }>
}

export interface BridgeDeviceInfo {
  platform: 'ios' | 'android' | 'web' | 'unknown'
  model?: string
  system?: string
  appVersion?: string
  [key: string]: unknown
}

export interface BridgeLocation {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface BridgeDevice {
  getInfo(): Promise<BridgeDeviceInfo>
  getLocation(): Promise<BridgeLocation>
}

export interface BridgeClipboard {
  write(text: string): Promise<void>
  read(): Promise<string>
}

// ─── Bridge Facade ──────────────────────────────────────────────────────────

export interface Bridge {
  /** 当前宿主 */
  readonly host: H5Host
  /** 能力嗅探 */
  hasAbility(ability: BridgeAbility): boolean

  readonly navigation: BridgeNavigation
  readonly storage: BridgeStorage
  readonly auth: BridgeAuth
  readonly ui: BridgeUI
  readonly event: BridgeEvent
  readonly payment: BridgePayment
  readonly device: BridgeDevice
  readonly clipboard: BridgeClipboard
}

/**
 * 各策略需要实现的"原始接口"：返回一个 Bridge（除了 host/hasAbility 之外的各子模块）
 * 以及自己的 abilities 集合。
 */
export interface BridgeStrategy {
  host: H5Host
  abilities: ReadonlySet<BridgeAbility>
  navigation: BridgeNavigation
  storage: BridgeStorage
  auth: BridgeAuth
  ui: BridgeUI
  event: BridgeEvent
  payment: BridgePayment
  device: BridgeDevice
  clipboard: BridgeClipboard
}
