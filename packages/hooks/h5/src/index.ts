/**
 * @vue3-mono/hooks-h5
 *
 * H5 端专用 hooks（依赖 Vant / @vue3-mono/bridge / vue-router）
 *
 * - useVantMessage：Vant 消息 API 的统一封装
 * - useVConsole：移动端 vconsole 单例挂载
 * - useHistoryStackH5：栈式 keep-alive 路由绑定
 * - createUseThemeH5：主题 + Vant Locale 联动工厂
 * - useLogin：多宿主登录策略（bridge + form 双路）
 * - useSmsCodeGate：短信验证码发送节流（自 @vue3-mono/hooks 再导出，便于 H5 侧单一入口）
 */

export { useSmsCodeGate } from '@vue3-mono/hooks'
export type { UseSmsCodeGateReturn } from '@vue3-mono/hooks'

export * from './useVantMessage'
export * from './useVConsole'
export * from './useHistoryStackH5'
export * from './useThemeH5'
export * from './useLogin'
export * from './useProListFilters'
