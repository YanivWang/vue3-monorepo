# Design Token 系统

Design Token 是设计与代码之间的**共同语言**，将颜色、字号、间距等设计决策以命名常量的形式管理，确保设计与代码保持一致。

## 概览

Token 由 **`@vue3-monorepo/shared`** 与各应用样式入口共同组成，跨 PC / H5 对齐：

| 层级                   | 源码位置                                                                                                                                                                                                | 用途                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **色值单源（JSON）**   | `packages/shared/src/styles/theme-palette.json`                                                                                                                                                         | 品牌色、语义色、暗色覆盖的**唯一编辑入口**                                     |
| **生成产物**           | `pnpm generate:theme` → `_variables.scss`、`_brands.scss`、`_dark.scss`、`_dark-element.scss`、`brands.config.ts`                                                                                       | 自动生成，勿手改                                                               |
| **Sass 变量（`$*`）**  | `packages/shared/src/styles/tokens/_variables.scss`（生成），经各端 `vite.config` → `css.preprocessorOptions.scss.additionalData` 注入 **`@use "@vue3-monorepo/shared/styles/tokens/variables" as *;`** | `$spacing-md`、`$layout-header-height` 等，无需在每个 SFC 手动 `@use`          |
| **`:root` CSS 变量**   | `packages/shared/src/styles/tokens/_root.scss`（手写派生）；入口 `tokens/index.scss`；品牌见 `_brands.scss`（生成）                                                                                     | `--color-primary`、`--color-bg-page`、`--layout-sidebar-bg` 等                 |
| **暗黑覆盖**           | **共享** `tokens/_dark.scss`（生成）；**Element Plus** `tokens/_dark-element.scss`（生成，引用 `--color-*`）                                                                                            | 暗色下 `--color-text-*`、`--color-bg-*`、`--color-fill-*`；PC Element `--el-*` |
| **Pattern 层**         | `packages/shared/src/styles/patterns/`（`.ds-panel`、`.ds-surface-card`）                                                                                                                               | 跨端复用页面块样式                                                             |
| **品牌色 TS**          | `packages/shared/src/styles/brands.config.ts`（生成）                                                                                                                                                   | `brandPalettes`、UI 下拉与 `_brands.scss` 对齐                                 |
| **TypeScript**         | `packages/shared/src/styles/tokens.ts`                                                                                                                                                                  | `cssVarTokens`、`getCssVar`/`setCssVar`、`applyBrand`、`applyThemeMode`        |
| **Composable（可选）** | `packages/shared/src/hooks-core/useTheme.ts`、`hooks-h5/useThemeH5.ts`                                                                                                                                  | `createUseTheme`、`createUseThemeH5`：自定义 storage 时替代 Pinia 写 DOM       |

## 颜色 Token

### 品牌色

| Token 名称      | CSS 变量          | 默认值    | 说明               |
| --------------- | ----------------- | --------- | ------------------ |
| `color.primary` | `--color-primary` | `#409eff` | 主色，按钮、链接等 |
| `color.success` | `--color-success` | `#67c23a` | 成功状态           |
| `color.warning` | `--color-warning` | `#e6a23c` | 警告状态           |
| `color.danger`  | `--color-danger`  | `#f56c6c` | 错误/危险状态      |
| `color.info`    | `--color-info`    | `#909399` | 信息提示           |

### 文字颜色

| Token 名称              | CSS 变量                   | 亮色值    | 暗色值    |
| ----------------------- | -------------------------- | --------- | --------- |
| `color.textPrimary`     | `--color-text-primary`     | `#303133` | `#e5eaf3` |
| `color.textRegular`     | `--color-text-regular`     | `#606266` | `#cfd3dc` |
| `color.textSecondary`   | `--color-text-secondary`   | `#909399` | `#a3a6ad` |
| `color.textPlaceholder` | `--color-text-placeholder` | `#c0c4cc` | `#6c6e72` |

### 背景颜色

| Token 名称         | CSS 变量              | 亮色值    | 暗色值    |
| ------------------ | --------------------- | --------- | --------- |
| `color.bgPage`     | `--color-bg-page`     | `#f0f2f5` | `#0d0d0d` |
| `color.bgSurface`  | `--color-bg-surface`  | `#ffffff` | `#141414` |
| `color.bgElevated` | `--color-bg-elevated` | `#ffffff` | `#1d1e20` |

## 字体 Token

`tokens.typography.*` 里存的是 **CSS 变量引用串**（`var(--font-size-base)` 等），直接写进内联样式即可，实际取值由 `_root.scss` 决定：

```ts
import { tokens } from '@vue3-monorepo/shared/styles/tokens'

// 字号
tokens.typography.fontSize.base // 'var(--font-size-base)' → 14px
tokens.typography.fontSize.lg // 'var(--font-size-lg)'   → 18px

// 字重
tokens.typography.fontWeight.medium // 'var(--font-weight-medium)' → 500
tokens.typography.fontWeight.bold // 'var(--font-weight-bold)'   → 700
```

### 字号规范

| Token  | 值   | 典型场景           |
| ------ | ---- | ------------------ |
| `xs`   | 12px | 辅助文字、标签     |
| `sm`   | 13px | 次要信息           |
| `base` | 14px | 正文（默认）       |
| `md`   | 16px | 小标题             |
| `lg`   | 18px | 卡片标题           |
| `xl`   | 20px | 页面标题           |
| `2xl`  | 24px | 大标题             |
| `3xl`  | 30px | 数据大屏、统计数值 |
| `4xl`  | 36px | 首屏主标题         |

## 间距 Token

遵循 4px 基础网格：

| Token         | 值   | 场景               |
| ------------- | ---- | ------------------ |
| `spacing.xs`  | 4px  | 紧凑元素内边距     |
| `spacing.sm`  | 8px  | 列表项、小间距     |
| `spacing.md`  | 16px | 卡片内边距（默认） |
| `spacing.lg`  | 24px | 区块间距           |
| `spacing.xl`  | 32px | 大区块间距         |
| `spacing.2xl` | 48px | 页面级间距         |

## 圆角 Token

| Token                 | 值     | 典型组件     |
| --------------------- | ------ | ------------ |
| `borderRadius.base`   | 4px    | 按钮、输入框 |
| `borderRadius.medium` | 6px    | 卡片         |
| `borderRadius.large`  | 8px    | 弹窗、面板   |
| `borderRadius.full`   | 9999px | 标签、头像   |

## 断点 Token

`tokens.breakpoint`、`tokens.spacing`、`tokens.borderRadius`、`tokens.zIndex`、`tokens.layout` 是**字面量**（非 CSS 变量），可直接参与 JS 计算：

```ts
tokens.breakpoint.sm // '576px'
tokens.breakpoint.md // '768px'
tokens.breakpoint.lg // '992px'
tokens.breakpoint.xl // '1200px'
```

在 SCSS 中使用：

```scss
// 直接使用变量（与 tokens.ts 保持一致）
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}
```

## 在代码中使用

### 在 Vue 组件中

```vue
<template>
  <div class="card">内容</div>
</template>

<style lang="scss" scoped>
.card {
  padding: $spacing-md; // SCSS 变量
  border-radius: $radius-medium;
  background-color: var(--color-bg-elevated); // CSS 变量（支持暗黑模式）
  box-shadow: var(--shadow-base);
}
</style>
```

### 在 JavaScript 逻辑中

```ts
import { cssVarTokens, getCssVar, setCssVar } from '@vue3-monorepo/shared/styles/tokens'

const primaryColor = getCssVar(cssVarTokens.color.primary)

// 动态修改主题（运行时换肤）
setCssVar(cssVarTokens.color.primary, '#1890ff')

// 类型安全的 z-index（同样来自 @vue3-monorepo/shared/styles/tokens）
import { tokens } from '@vue3-monorepo/shared/styles/tokens'
const modalZ = tokens.zIndex.modal // 1040（TypeScript 可推断具体数值）
```

## 主题扩展

**修改色值**：编辑 `packages/shared/src/styles/theme-palette.json`，然后运行：

```bash
pnpm generate:theme
```

`admin:build` / `h5:build` 会自动先执行生成（根脚本里前置了 `pnpm generate:theme`）。不要手改 `_variables.scss`、`_brands.scss`、`_dark.scss`、`_dark-element.scss`、`brands.config.ts`——`pnpm run check:theme`（`verify:full` 的一环）会重跑生成并比对 diff，手改会导致门禁失败。

- **新增品牌预设**：在 `theme-palette.json` 的 `brands` 中追加条目，重新生成；`_root.scss` 中如有品牌相关派生 token 需手写维护。
- **修改默认主色（blue）**：改 JSON 中 `brands.blue` 与 `light` 区块，重新生成。
- **某应用独占的 Element 暗黑变量**：在 `theme-palette.json` 的 `dark.element` 中维护，重新生成后写入 `tokens/_dark-element.scss`。
- **Stylelint**：`apps/**/src` 与共享组件启用 `color-no-hex`；`tokens/`、`patterns/` 豁免。

## 与 Figma 对接

推荐工作流：

1. 设计师在 Figma 中使用 **Figma Tokens** 插件管理 Token
2. 导出为 JSON，合并进 `theme-palette.json`（或替换该文件结构）
3. 运行 `pnpm generate:theme` 生成 SCSS / TS
4. 提交 JSON + 生成文件，CI 验证是否同步
