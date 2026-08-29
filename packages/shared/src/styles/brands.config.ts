/**
 * AUTO-GENERATED — 请勿手改。编辑 packages/shared/src/styles/theme-palette.json 后运行 pnpm generate:theme
 * 品牌色单源 — 与 tokens/_brands.scss 保持同步（blue 使用 :root 默认值，不在 _brands 中重复）
 */

export type BrandId = 'blue' | 'green' | 'red' | 'orange' | 'purple'

export interface BrandPaletteConfig {
  id: BrandId
  primary: string
  primaryHover: string
  primaryActive: string
  primarySubtle: string
  primaryBorder: string
  sidebarItemActiveBg: string
  borderDefault: string
  borderSubtle: string
  headerBorder: string
  info: string
}

export const brandConfigs = {
  blue: {
    id: 'blue',
    primary: '#409eff',
    primaryHover: '#79bbff',
    primaryActive: '#337ecc',
    primarySubtle: '#ecf5ff',
    primaryBorder: '#b3d8ff',
    sidebarItemActiveBg: '#409eff',
    borderDefault: '#dcdfe6',
    borderSubtle: '#e4e7ed',
    headerBorder: '#e8eaec',
    info: '#909399',
  },
  green: {
    id: 'green',
    primary: '#07c160',
    primaryHover: '#3ecf82',
    primaryActive: '#06a54f',
    primarySubtle: '#e8f8ef',
    primaryBorder: '#95d9b3',
    sidebarItemActiveBg: '#07c160',
    borderDefault: '#bfddd0',
    borderSubtle: '#e2f3eb',
    headerBorder: '#d9eee4',
    info: '#7d8a82',
  },
  red: {
    id: 'red',
    primary: '#ee0a24',
    primaryHover: '#ff4d4f',
    primaryActive: '#c20619',
    primarySubtle: '#fff1f0',
    primaryBorder: '#ffa39e',
    sidebarItemActiveBg: '#ee0a24',
    borderDefault: '#e5ced1',
    borderSubtle: '#f7eaea',
    headerBorder: '#f0e0e3',
    info: '#909399',
  },
  orange: {
    id: 'orange',
    primary: '#ff8c00',
    primaryHover: '#ffa940',
    primaryActive: '#d77300',
    primarySubtle: '#fff7e6',
    primaryBorder: '#ffd591',
    sidebarItemActiveBg: '#ff8c00',
    borderDefault: '#e5d9c9',
    borderSubtle: '#f5efe6',
    headerBorder: '#ede4d6',
    info: '#968f85',
  },
  purple: {
    id: 'purple',
    primary: '#722ed1',
    primaryHover: '#9254de',
    primaryActive: '#531dab',
    primarySubtle: '#f9f0ff',
    primaryBorder: '#d3adf7',
    sidebarItemActiveBg: '#722ed1',
    borderDefault: '#d6cfe6',
    borderSubtle: '#eae6f5',
    headerBorder: '#e3ddf0',
    info: '#8a8699',
  },
} as const satisfies Record<BrandId, BrandPaletteConfig>

export const brandPalettes = Object.values(brandConfigs)
