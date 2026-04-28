/**
 * 共享包内主题 / 品牌运行时 API（与 `./tokens/*.scss` 中 `data-brand`、`html.dark` 配合）
 */

/** 品牌 ID；与 `html[data-brand='xxx']` 一一对应 */
export type BrandId = 'blue' | 'green' | 'red' | 'orange' | 'purple'

/** 深浅模式三态；`system` 时的行为见 `applyThemeMode`（监听 `prefers-color-scheme`） */
export type ThemeModeId = 'light' | 'dark' | 'system'

export interface BrandPalette {
  id: BrandId
  primary: string
}

/** 品牌预设；顺序即默认推荐顺序 */
export const brandPalettes: readonly BrandPalette[] = [
  { id: 'blue', primary: '#409eff' },
  { id: 'green', primary: '#07c160' },
  { id: 'red', primary: '#ee0a24' },
  { id: 'orange', primary: '#ff8c00' },
  { id: 'purple', primary: '#722ed1' }
] as const

/** 应用品牌：设置 `html[data-brand]`（色值由 _brands.scss 随 data-brand 提供） */
export function applyBrand(id: BrandId): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-brand', id)
}

/** 读取当前品牌（未设置时默认 'blue'） */
export function getAppliedBrand(): BrandId {
  if (typeof document === 'undefined') return 'blue'
  return (document.documentElement.getAttribute('data-brand') as BrandId) ?? 'blue'
}

/**
 * 应用深浅模式（只操作 `html` 的 `.dark` class）：
 * - `light` / `dark`：固定 class，返回空清理函数
 * - `system`：按 `prefers-color-scheme` 设置 class，并监听变化；返回的函数用于移除该监听
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

/**
 * 根据 `html` 是否带有 `.dark` 返回 `light` | `dark`（与当前实际外观一致）
 * 无法区分「用户选了 dark」与「system 且系统当前为暗色」，若需区分应读业务里的 `themeMode`
 */
export function getAppliedThemeMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}
