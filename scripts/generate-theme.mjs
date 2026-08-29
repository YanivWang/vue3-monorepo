/**
 * generate-theme：由 packages/shared/src/styles/theme-palette.json 生成主题产物。
 *
 * 产物（均带 AUTO-GENERATED 头，请勿手改）：
 *   tokens/_variables.scss     Sass 构建期默认值
 *   tokens/_brands.scss        html[data-brand=…] 品牌覆盖（默认品牌用 :root，不重复）
 *   tokens/_dark.scss          html.dark 业务 token 覆盖
 *   tokens/_dark-element.scss  html.dark 下的 Element Plus --el-* 覆盖
 *   brands.config.ts           运行时可用的 brandConfigs / brandPalettes
 *
 * 由 `pnpm generate:theme` 手动调用，并被 admin:build / h5:build 前置执行；
 * `pnpm run check:theme` 会重跑本脚本比对 diff。
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const stylesDir = join(__dirname, '../packages/shared/src/styles')
const tokensDir = join(stylesDir, 'tokens')
const palette = JSON.parse(readFileSync(join(stylesDir, 'theme-palette.json'), 'utf8'))

const { defaultBrand, brands, light, dark, brandCssVarMap } = palette
const defaultPalette = brands[defaultBrand]

const fileHeader = `// AUTO-GENERATED — 请勿手改。编辑 packages/shared/src/styles/theme-palette.json 后运行 pnpm generate:theme
`

const tsFileHeader = `/**
 * AUTO-GENERATED — 请勿手改。编辑 packages/shared/src/styles/theme-palette.json 后运行 pnpm generate:theme
 * 品牌色单源 — 与 tokens/_brands.scss 保持同步（${defaultBrand} 使用 :root 默认值，不在 _brands 中重复）
 */
`

const variables = `${fileHeader}
// Design Token — Sass 构建期默认值（不直接输出 CSS）

// 主色（默认品牌 ${defaultBrand}）
$color-primary: ${defaultPalette.primary};
$color-primary-hover: ${defaultPalette.primaryHover};
$color-primary-active: ${defaultPalette.primaryActive};
$color-primary-subtle: ${defaultPalette.primarySubtle};
$color-primary-border: ${defaultPalette.primaryBorder};

// 语义色
$color-success: ${light.semantic.success};
$color-warning: ${light.semantic.warning};
$color-danger: ${light.semantic.danger};
$color-info: ${defaultPalette.info};

// 文字
$color-text-primary: ${light.text.primary};
$color-text-regular: ${light.text.regular};
$color-text-secondary: ${light.text.secondary};
$color-text-placeholder: ${light.text.placeholder};

// 背景
$color-bg-page: ${light.background.page};
$color-bg-surface: ${light.background.surface};
$color-bg-elevated: ${light.background.elevated};
$color-bg-overlay: ${light.background.overlay};

// 边框
$color-border-default: ${light.border.default};
$color-border-subtle: ${light.border.subtle};

// 布局 — 侧栏
$layout-sidebar-bg: ${light.layout.sidebarBg};
$layout-sidebar-text: ${light.layout.sidebarText};
$layout-sidebar-text-active: ${light.layout.sidebarTextActive};
$layout-sidebar-item-hover-bg: ${light.layout.sidebarItemHoverBg};
$layout-sidebar-item-active-bg: ${defaultPalette.sidebarItemActiveBg};

// 布局 — 头部
$layout-header-bg: ${light.layout.headerBg};
$layout-header-border: ${defaultPalette.headerBorder};

// 布局尺寸
$layout-header-height: ${light.layout.headerHeight};
$layout-sidebar-width: ${light.layout.sidebarWidth};
$layout-sidebar-width-collapsed: ${light.layout.sidebarWidthCollapsed};
$layout-footer-height: ${light.layout.footerHeight};

// 间距
$spacing-xs: ${light.spacing.xs};
$spacing-sm: ${light.spacing.sm};
$spacing-md: ${light.spacing.md};
$spacing-lg: ${light.spacing.lg};
$spacing-xl: ${light.spacing.xl};

// 圆角
$radius-base: ${light.radius.base};
$radius-medium: ${light.radius.medium};
$radius-large: ${light.radius.large};

// 阴影
$shadow-base:
  0 2px 4px rgba(0, 0, 0, 0.12),
  0 0 6px rgba(0, 0, 0, 0.04);
$shadow-medium: ${light.shadow.medium};

// 过渡
$transition-base: all 0.3s ease;
$transition-fast: all 0.15s ease;

// z-index
$z-index-base: ${light.zIndex.base};
$z-index-dropdown: ${light.zIndex.dropdown};
$z-index-sticky: ${light.zIndex.sticky};
$z-index-fixed: ${light.zIndex.fixed};
$z-index-modal: ${light.zIndex.modal};
$z-index-popover: ${light.zIndex.popover};
$z-index-tooltip: ${light.zIndex.tooltip};

// 排版
$font-family-base: ${light.typography.fontFamily};
$font-size-xs: ${light.typography.fontSize.xs};
$font-size-sm: ${light.typography.fontSize.sm};
$font-size-base: ${light.typography.fontSize.base};
$font-size-md: ${light.typography.fontSize.md};
$font-size-lg: ${light.typography.fontSize.lg};
$font-size-xl: ${light.typography.fontSize.xl};
$font-size-2xl: ${light.typography.fontSize['2xl']};
$font-size-3xl: ${light.typography.fontSize['3xl']};
$font-size-4xl: ${light.typography.fontSize['4xl']};
$font-weight-normal: ${light.typography.fontWeight.normal};
$font-weight-medium: ${light.typography.fontWeight.medium};
$font-weight-semibold: ${light.typography.fontWeight.semibold};
$font-weight-bold: ${light.typography.fontWeight.bold};
$line-height-tight: ${light.typography.lineHeight.tight};
$line-height-normal: ${light.typography.lineHeight.normal};
$line-height-relaxed: ${light.typography.lineHeight.relaxed};
`

const brandScssEntries = Object.entries(brands)
  .filter(([id]) => id !== defaultBrand)
  .map(([id, brand]) => {
    const lines = Object.entries(brandCssVarMap)
      .map(([key, cssVar]) => `  ${cssVar}: ${brand[key]};`)
      .join('\n')

    return `html[data-brand='${id}'] {\n${lines}\n}`
  })
  .join('\n\n')

const brandsScss = `${fileHeader}
// 品牌色预设 — 与 brands.config.ts 同步
// ${defaultBrand} 使用 :root 默认值，此处仅覆盖其它品牌

${brandScssEntries}
`

const darkScss = `${fileHeader}
// 暗黑模式 — 业务层 token 覆盖（不含 Element Plus / Vant）

html.dark {
  --color-text-primary: ${dark.text.primary};
  --color-text-regular: ${dark.text.regular};
  --color-text-secondary: ${dark.text.secondary};
  --color-text-placeholder: ${dark.text.placeholder};
  --color-bg-page: ${dark.background.page};
  --color-bg-surface: ${dark.background.surface};
  --color-bg-elevated: ${dark.background.elevated};
  --color-bg-overlay: ${dark.background.overlay};
  --color-border-default: ${dark.border.default};
  --color-border-subtle: ${dark.border.subtle};
  --layout-sidebar-bg: ${dark.layout.sidebarBg};
  --layout-sidebar-text: ${dark.layout.sidebarText};
  --layout-sidebar-text-active: ${dark.layout.sidebarTextActive};
  --layout-sidebar-item-hover-bg: ${dark.layout.sidebarItemHoverBg};
  --layout-sidebar-item-active-bg: var(--color-primary);
  --layout-header-bg: ${dark.layout.headerBg};
  --layout-header-border: ${dark.layout.headerBorder};
  --color-fill-default: ${dark.fill.default};
  --color-fill-light: ${dark.fill.light};
  --color-fill-lighter: ${dark.fill.lighter};
  --color-fill-extra-light: ${dark.fill.extraLight};
  --color-fill-dark: ${dark.fill.dark};
  --color-fill-darker: ${dark.fill.darker};
  --shadow-base: ${dark.shadow.base};
  --shadow-medium: ${dark.shadow.medium};
}
`

const darkElementScss = `${fileHeader}
// Element Plus 暗黑变量 — 优先引用业务 token，Element 专有项来自 palette.dark.element

html.dark {
  --el-color-white: var(--color-bg-surface);
  --el-color-black: var(--layout-sidebar-text-active);
  --el-bg-color: var(--color-bg-surface);
  --el-bg-color-page: var(--color-bg-page);
  --el-bg-color-overlay: var(--color-bg-elevated);
  --el-text-color-primary: var(--color-text-primary);
  --el-text-color-regular: var(--color-text-regular);
  --el-text-color-secondary: var(--color-text-secondary);
  --el-text-color-placeholder: var(--color-text-placeholder);
  --el-text-color-disabled: ${dark.element.textDisabled};
  --el-border-color: var(--color-border-default);
  --el-border-color-light: var(--color-border-subtle);
  --el-border-color-lighter: ${dark.element.borderLighter};
  --el-border-color-extra-light: ${dark.element.borderExtraLight};
  --el-border-color-dark: ${dark.element.borderDark};
  --el-border-color-darker: ${dark.element.borderDarker};
  --el-fill-color: var(--color-fill-default);
  --el-fill-color-light: var(--color-fill-light);
  --el-fill-color-lighter: var(--color-fill-lighter);
  --el-fill-color-extra-light: var(--color-fill-extra-light);
  --el-fill-color-dark: var(--color-fill-dark);
  --el-fill-color-darker: var(--color-fill-darker);
  --el-fill-color-blank: transparent;
  --el-box-shadow: ${dark.element.boxShadow};
  --el-box-shadow-light: ${dark.element.boxShadowLight};
  --el-box-shadow-lighter: ${dark.element.boxShadowLighter};
  --el-box-shadow-dark: ${dark.element.boxShadowDark};
  --el-overlay-color: ${dark.element.overlayColor};
  --el-overlay-color-light: var(--color-bg-overlay);
  --el-overlay-color-lighter: ${dark.element.overlayColorLighter};
  --el-disabled-bg-color: var(--color-fill-default);
  --el-disabled-text-color: ${dark.element.textDisabled};
  --el-disabled-border-color: var(--color-border-subtle);
  --el-menu-bg-color: var(--layout-sidebar-bg);
  --el-menu-text-color: var(--layout-sidebar-text);
  --el-menu-active-color: var(--layout-sidebar-text-active);
  --el-menu-hover-bg-color: var(--layout-sidebar-item-hover-bg);
}
`

const brandIds = Object.keys(brands)
const brandIdUnion = brandIds.map((id) => `'${id}'`).join(' | ')

const brandConfigEntries = brandIds
  .map((id) => {
    const brand = brands[id]
    const fields = [`id: '${id}'`, ...Object.keys(brandCssVarMap).map((key) => `${key}: '${brand[key]}'`)]

    return `  ${id}: {\n    ${fields.join(',\n    ')}\n  }`
  })
  .join(',\n')

const brandsConfigTs = `${tsFileHeader}
export type BrandId = ${brandIdUnion}

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
${brandConfigEntries}
} as const satisfies Record<BrandId, BrandPaletteConfig>

export const brandPalettes = Object.values(brandConfigs)
`

const written = [
  join(tokensDir, '_variables.scss'),
  join(tokensDir, '_brands.scss'),
  join(tokensDir, '_dark.scss'),
  join(tokensDir, '_dark-element.scss'),
  join(stylesDir, 'brands.config.ts'),
]

writeFileSync(written[0], variables)
writeFileSync(written[1], brandsScss)
writeFileSync(written[2], darkScss)
writeFileSync(written[3], darkElementScss)
writeFileSync(written[4], brandsConfigTs)

// 产物同样受根 prettier 约束（长的 $font-family-base 等会被折行）。
// 这里直接格式化一遍，保证「生成结果」与「仓库里已格式化的文件」逐字节一致，
// 否则 `pnpm run check:theme` / `prettier --check .` 会互相打架。
execFileSync('node', [join(root, 'node_modules/prettier/bin/prettier.cjs'), '--write', ...written], {
  cwd: root,
  stdio: 'ignore',
})

console.log('Generated theme files from theme-palette.json')
