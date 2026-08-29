/**
 * 共享 Design Token — 运行时主题 API + CSS 变量名 + 设计元数据
 */
import { brandConfigs, brandPalettes, type BrandId } from './brands.config'

export type { BrandId, BrandPaletteConfig as BrandPalette } from './brands.config'
export { brandConfigs, brandPalettes }

/** 深浅模式三态 */
export type ThemeModeId = 'light' | 'dark' | 'system'

/** CSS 自定义属性名（与 tokens/_root.scss 对齐） */
export const cssVarTokens = {
  color: {
    primary: '--color-primary',
    primaryHover: '--color-primary-hover',
    primaryActive: '--color-primary-active',
    primarySubtle: '--color-primary-subtle',
    primaryBorder: '--color-primary-border',
    success: '--color-success',
    warning: '--color-warning',
    danger: '--color-danger',
    info: '--color-info',
    textPrimary: '--color-text-primary',
    textRegular: '--color-text-regular',
    textSecondary: '--color-text-secondary',
    textPlaceholder: '--color-text-placeholder',
    bgPage: '--color-bg-page',
    bgSurface: '--color-bg-surface',
    bgElevated: '--color-bg-elevated',
    bgOverlay: '--color-bg-overlay',
    borderDefault: '--color-border-default',
    borderSubtle: '--color-border-subtle',
  },
  layout: {
    sidebarBg: '--layout-sidebar-bg',
    sidebarText: '--layout-sidebar-text',
    sidebarTextActive: '--layout-sidebar-text-active',
    sidebarItemHoverBg: '--layout-sidebar-item-hover-bg',
    sidebarItemActiveBg: '--layout-sidebar-item-active-bg',
    headerBg: '--layout-header-bg',
    headerBorder: '--layout-header-border',
    headerHeight: '--layout-header-height',
    sidebarWidth: '--layout-sidebar-width',
    sidebarWidthCollapsed: '--layout-sidebar-width-collapsed',
    footerHeight: '--layout-footer-height',
  },
  spacing: {
    xs: '--spacing-xs',
    sm: '--spacing-sm',
    md: '--spacing-md',
    lg: '--spacing-lg',
    xl: '--spacing-xl',
  },
  radius: {
    base: '--radius-base',
    medium: '--radius-medium',
    large: '--radius-large',
  },
  shadow: {
    base: '--shadow-base',
    medium: '--shadow-medium',
  },
  typography: {
    fontFamily: '--font-family-base',
    fontSizeXs: '--font-size-xs',
    fontSizeSm: '--font-size-sm',
    fontSizeBase: '--font-size-base',
    fontSizeMd: '--font-size-md',
    fontSizeLg: '--font-size-lg',
    fontSizeXl: '--font-size-xl',
    fontSize2xl: '--font-size-2xl',
    fontSize3xl: '--font-size-3xl',
    fontSize4xl: '--font-size-4xl',
    fontWeightNormal: '--font-weight-normal',
    fontWeightMedium: '--font-weight-medium',
    fontWeightSemibold: '--font-weight-semibold',
    fontWeightBold: '--font-weight-bold',
    lineHeightTight: '--line-height-tight',
    lineHeightNormal: '--line-height-normal',
    lineHeightRelaxed: '--line-height-relaxed',
  },
} as const

export const typographyTokens = {
  fontFamily: 'var(--font-family-base)',
  fontSize: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    md: 'var(--font-size-md)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
  },
  fontWeight: {
    normal: 'var(--font-weight-normal)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
  },
  lineHeight: {
    tight: 'var(--line-height-tight)',
    normal: 'var(--line-height-normal)',
    relaxed: 'var(--line-height-relaxed)',
  },
} as const

export const spacingTokens = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const

export const borderRadiusTokens = {
  none: '0',
  sm: '2px',
  base: '4px',
  medium: '6px',
  large: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const

export const breakpointTokens = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1600px',
} as const

export const zIndexTokens = {
  base: 1,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1070,
} as const

export const layoutTokens = {
  headerHeight: '60px',
  sidebarWidth: '220px',
  sidebarWidthCollapsed: '64px',
  footerHeight: '50px',
  contentMaxWidth: '1440px',
} as const

export const tokens = {
  cssVar: cssVarTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  borderRadius: borderRadiusTokens,
  breakpoint: breakpointTokens,
  zIndex: zIndexTokens,
  layout: layoutTokens,
} as const

export function getCssVar(token: string, el: HTMLElement = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(token).trim()
}

export function setCssVar(token: string, value: string, el: HTMLElement = document.documentElement): void {
  el.style.setProperty(token, value)
}

export function applyBrand(id: BrandId): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-brand', id)
}

export function getAppliedBrand(): BrandId {
  if (typeof document === 'undefined') return 'blue'
  return (document.documentElement.getAttribute('data-brand') as BrandId) ?? 'blue'
}

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

export function getAppliedThemeMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}
