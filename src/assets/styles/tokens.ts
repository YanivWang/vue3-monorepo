/**
 * Design Token 系统
 *
 * 将 CSS 变量以 JavaScript 对象的形式管理，实现：
 * - 设计与代码的单一来源（Single Source of Truth）
 * - TypeScript 类型安全的 Token 引用
 * - 方便与设计工具（Figma Tokens / Style Dictionary）对接
 *
 * 使用方式：
 *   import { tokens } from '@/assets/styles/tokens'
 *   // 在 JS 逻辑中读取 CSS 变量值
 *   const primary = getComputedStyle(document.documentElement).getPropertyValue(tokens.color.primary)
 */

// ── 颜色系统 ──────────────────────────────────────────────────
export const colorTokens = {
  // 品牌主色
  primary: '--color-primary',
  success: '--color-success',
  warning: '--color-warning',
  danger: '--color-danger',
  info: '--color-info',

  // 文字颜色
  textPrimary: '--text-primary',
  textRegular: '--text-regular',
  textSecondary: '--text-secondary',
  textPlaceholder: '--text-placeholder',

  // 背景颜色
  bgPage: '--bg-page',
  bgWhite: '--bg-white',
  bgCard: '--bg-card',
  bgOverlay: '--bg-overlay',

  // 边框颜色
  borderColor: '--border-color',
  borderColorLight: '--border-color-light',

  // 侧边栏
  sidebarBg: '--sidebar-bg',
  sidebarText: '--sidebar-text',
  sidebarTextActive: '--sidebar-text-active',
  sidebarItemHoverBg: '--sidebar-item-hover-bg',
  sidebarItemActiveBg: '--sidebar-item-active-bg',

  // 头部
  headerBg: '--header-bg',
  headerBorder: '--header-border'
} as const

// ── 字体系统 ──────────────────────────────────────────────────
export const typographyTokens = {
  // 字号
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px'
  },

  // 字重
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },

  // 行高
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  },

  // 字体族
  fontFamily: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace"
  }
} as const

// ── 间距系统 ──────────────────────────────────────────────────
export const spacingTokens = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px'
} as const

// ── 圆角系统 ──────────────────────────────────────────────────
export const borderRadiusTokens = {
  none: '0',
  sm: '2px',
  base: '4px',
  medium: '6px',
  large: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px'
} as const

// ── 阴影系统 ──────────────────────────────────────────────────
export const shadowTokens = {
  base: '--box-shadow-base',
  medium: '--box-shadow-medium'
} as const

// ── 动画系统 ──────────────────────────────────────────────────
export const transitionTokens = {
  fast: '0.15s ease',
  base: '0.3s ease',
  slow: '0.5s ease',

  // 缓动函数
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
} as const

// ── 断点系统 ──────────────────────────────────────────────────
export const breakpointTokens = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1600px'
} as const

// ── 层级系统 ──────────────────────────────────────────────────
export const zIndexTokens = {
  base: 1,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1070
} as const

// ── 布局系统 ──────────────────────────────────────────────────
export const layoutTokens = {
  headerHeight: '60px',
  sidebarWidth: '220px',
  sidebarWidthCollapsed: '64px',
  footerHeight: '50px',
  contentMaxWidth: '1440px'
} as const

// ── 统一导出 ──────────────────────────────────────────────────
export const tokens = {
  color: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  borderRadius: borderRadiusTokens,
  shadow: shadowTokens,
  transition: transitionTokens,
  breakpoint: breakpointTokens,
  zIndex: zIndexTokens,
  layout: layoutTokens
} as const

export type Tokens = typeof tokens

// ── 工具函数 ──────────────────────────────────────────────────

/**
 * 读取 CSS 自定义属性的当前值
 * @example getCssVar(tokens.color.primary) // '#409eff'
 */
export function getCssVar(token: string, el: HTMLElement = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(token).trim()
}

/**
 * 设置 CSS 自定义属性值（用于运行时动态主题）
 * @example setCssVar(tokens.color.primary, '#1890ff')
 */
export function setCssVar(token: string, value: string, el: HTMLElement = document.documentElement): void {
  el.style.setProperty(token, value)
}
