/**
 * Design Token 系统（运行时 / JS 端）
 *
 * 将 CSS 变量以 JavaScript 对象的形式管理，实现：
 * - 设计与代码的单一来源（Single Source of Truth）
 * - TypeScript 类型安全的 Token 引用
 * - 运行时读取 / 设置 CSS 变量，用于主题切换
 *
 * 搭配：`./tokens/*.scss` 提供编译期对应的 SCSS 变量与 `:root` 定义。
 */

export const colorTokens = {
  primary: '--color-primary',
  primaryLight: '--color-primary-light',
  primaryDark: '--color-primary-dark',
  success: '--color-success',
  warning: '--color-warning',
  danger: '--color-danger',
  info: '--color-info',

  textPrimary: '--text-primary',
  textRegular: '--text-regular',
  textSecondary: '--text-secondary',
  textPlaceholder: '--text-placeholder',

  bgPage: '--bg-page',
  bgWhite: '--bg-white',
  bgCard: '--bg-card',
  bgOverlay: '--bg-overlay',

  borderColor: '--border-color',
  borderColorLight: '--border-color-light',

  sidebarBg: '--sidebar-bg',
  sidebarText: '--sidebar-text',
  sidebarTextActive: '--sidebar-text-active',
  sidebarItemHoverBg: '--sidebar-item-hover-bg',
  sidebarItemActiveBg: '--sidebar-item-active-bg',

  headerBg: '--header-bg',
  headerBorder: '--header-border'
} as const

export const typographyTokens = {
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
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  },
  fontFamily: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace"
  }
} as const

export const spacingTokens = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px'
} as const

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

export const shadowTokens = {
  base: '--box-shadow-base',
  medium: '--box-shadow-medium'
} as const

export const transitionTokens = {
  fast: '0.15s ease',
  base: '0.3s ease',
  slow: '0.5s ease',
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
} as const

export const breakpointTokens = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1600px'
} as const

export const zIndexTokens = {
  base: 1,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1070
} as const

export const layoutTokens = {
  headerHeight: '60px',
  sidebarWidth: '220px',
  sidebarWidthCollapsed: '64px',
  footerHeight: '50px',
  contentMaxWidth: '1440px'
} as const

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

/**
 * 读取 CSS 自定义属性的当前值
 * 仅浏览器环境可用；SSR/Node 场景调用请自行做运行时判断
 */
export function getCssVar(token: string, el?: HTMLElement): string {
  const target = el ?? (typeof document !== 'undefined' ? document.documentElement : null)
  if (!target) return ''
  return getComputedStyle(target).getPropertyValue(token).trim()
}

/**
 * 设置 CSS 自定义属性值（运行时动态主题）
 * 仅浏览器环境可用
 */
export function setCssVar(token: string, value: string, el?: HTMLElement): void {
  const target = el ?? (typeof document !== 'undefined' ? document.documentElement : null)
  if (!target) return
  target.style.setProperty(token, value)
}

// ──────────────────────────────────────────────────────────────
//  多品牌 / 多模式 运行时元数据（与 _brands.scss / dark.scss 对齐）
// ──────────────────────────────────────────────────────────────

/** 品牌 ID；与 html[data-brand='xxx'] 的取值一一对应 */
export type BrandId = 'blue' | 'green' | 'red' | 'orange' | 'purple'

/** 运行时模式；与 html.dark 是否生效一致；`system` 跟随系统（与 ThemeMode enum 对齐） */
export type ThemeModeId = 'light' | 'dark' | 'system'

export interface BrandPalette {
  id: BrandId
  label: string
  primary: string
  primaryLight: string
  primaryDark: string
}

/** 品牌预设；顺序即默认推荐顺序 */
export const brandPalettes: readonly BrandPalette[] = [
  {
    id: 'blue',
    label: '经典蓝',
    primary: '#409eff',
    primaryLight: '#79bbff',
    primaryDark: '#337ecc'
  },
  {
    id: 'green',
    label: '微信绿',
    primary: '#07c160',
    primaryLight: '#3ecf82',
    primaryDark: '#06a54f'
  },
  {
    id: 'red',
    label: '活力红',
    primary: '#ee0a24',
    primaryLight: '#ff4d4f',
    primaryDark: '#c20619'
  },
  {
    id: 'orange',
    label: '能量橙',
    primary: '#ff8c00',
    primaryLight: '#ffa940',
    primaryDark: '#d77300'
  },
  {
    id: 'purple',
    label: '典雅紫',
    primary: '#722ed1',
    primaryLight: '#9254de',
    primaryDark: '#531dab'
  }
] as const

/** 获取品牌 palette；找不到时返回第一个作为兜底 */
export function getBrandPalette(id: BrandId): BrandPalette {
  return brandPalettes.find(p => p.id === id) ?? brandPalettes[0]
}

/**
 * 应用品牌：设置 `html[data-brand]`；若 palette 传入则同步覆盖三个 primary 变量
 * （非侵入，主要靠 _brands.scss 选择器驱动，但手动覆盖便于业务自定义 palette）
 */
export function applyBrand(id: BrandId, override?: Partial<Omit<BrandPalette, 'id' | 'label'>>): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-brand', id)
  if (!override) return
  const target = document.documentElement
  if (override.primary) target.style.setProperty(colorTokens.primary, override.primary)
  if (override.primaryLight) target.style.setProperty(colorTokens.primaryLight, override.primaryLight)
  if (override.primaryDark) target.style.setProperty(colorTokens.primaryDark, override.primaryDark)
}

/** 读取当前品牌（未设置时默认 'blue'） */
export function getAppliedBrand(): BrandId {
  if (typeof document === 'undefined') return 'blue'
  return (document.documentElement.getAttribute('data-brand') as BrandId) ?? 'blue'
}

/**
 * 应用模式：
 *   - 'light'  → html 移除 dark class
 *   - 'dark'   → html 添加 dark class
 *   - 'system' → 跟随 matchMedia('(prefers-color-scheme: dark)')
 * 返回一个 teardown 函数，用于取消 system 模式的媒体查询监听
 */
export function applyThemeMode(mode: ThemeModeId): () => void {
  if (typeof document === 'undefined') return () => {}
  const root = document.documentElement
  const setDark = (dark: boolean) => root.classList.toggle('dark', dark)

  if (mode === 'light') {
    setDark(false)
    return () => {}
  }
  if (mode === 'dark') {
    setDark(true)
    return () => {}
  }

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    setDark(false)
    return () => {}
  }
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  setDark(mql.matches)
  const handler = (e: MediaQueryListEvent) => setDark(e.matches)
  mql.addEventListener('change', handler)
  return () => mql.removeEventListener('change', handler)
}

/** 读取当前已应用模式（不解析 system，如需识别 system 由业务层维护） */
export function getAppliedThemeMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}
