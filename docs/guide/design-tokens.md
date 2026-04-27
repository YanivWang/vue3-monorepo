# Design Token 系统

Design Token 是设计与代码之间的**共同语言**，将颜色、字号、间距等设计决策以命名常量的形式管理，确保设计与代码保持一致。

## 概览

本项目的 Token 分为两层（PC 应用内），并与 **`@vue3-monorepo/shared`** 中的 Token 对齐，便于跨端复用：

| 层级                      | 实现                                                                                                                                            | 用途                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **CSS 自定义属性**        | 应用内 `src/assets/styles/variables.scss` + `dark.scss`（`:root` / `html.dark`）                                                                | 样式层动态主题切换                      |
| **TypeScript Token 对象** | 应用内 `src/assets/styles/tokens.ts`；共享包 `packages/shared/src/styles/tokens.ts`（可 `import … from '@vue3-monorepo/shared/styles/tokens'`） | 逻辑层类型安全引用、`applyThemeMode` 等 |

Admin 模板优先使用**应用内** `tokens.ts` 与 SCSS 变量（与 Vite `additionalData` 注入的 `$spacing-*` 等一致）；需要与 H5 或 shared hooks 共用同一套 CSS 变量名时，以 shared 导出为准。

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

| Token 名称              | CSS 变量             | 亮色值    | 暗色值    |
| ----------------------- | -------------------- | --------- | --------- |
| `color.textPrimary`     | `--text-primary`     | `#303133` | `#e5eaf3` |
| `color.textRegular`     | `--text-regular`     | `#606266` | `#cfd3dc` |
| `color.textSecondary`   | `--text-secondary`   | `#909399` | `#a3a6ad` |
| `color.textPlaceholder` | `--text-placeholder` | `#c0c4cc` | `#6c6e72` |

### 背景颜色

| Token 名称      | CSS 变量     | 亮色值    | 暗色值    |
| --------------- | ------------ | --------- | --------- |
| `color.bgPage`  | `--bg-page`  | `#f0f2f5` | `#0d0d0d` |
| `color.bgWhite` | `--bg-white` | `#ffffff` | `#141414` |
| `color.bgCard`  | `--bg-card`  | `#ffffff` | `#1d1e20` |

## 字体 Token

```ts
import { tokens } from '@/assets/styles/tokens'

// 字号
tokens.typography.fontSize.base // '14px'
tokens.typography.fontSize.lg // '18px'

// 字重
tokens.typography.fontWeight.medium // '500'
tokens.typography.fontWeight.bold // '700'
```

### 字号规范

| Token  | 值   | 典型场景       |
| ------ | ---- | -------------- |
| `xs`   | 12px | 辅助文字、标签 |
| `sm`   | 13px | 次要信息       |
| `base` | 14px | 正文（默认）   |
| `md`   | 16px | 小标题         |
| `lg`   | 18px | 卡片标题       |
| `xl`   | 20px | 页面标题       |
| `2xl`  | 24px | 大标题         |

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
  border-radius: $border-radius-medium;
  background-color: var(--bg-card); // CSS 变量（支持暗黑模式）
  box-shadow: var(--box-shadow-base);
}
</style>
```

### 在 JavaScript 逻辑中

```ts
import { tokens, getCssVar, setCssVar } from '@/assets/styles/tokens'

// 读取当前主题色
const primaryColor = getCssVar(tokens.color.primary)

// 动态修改主题（运行时换肤）
setCssVar(tokens.color.primary, '#1890ff')

// 类型安全的 z-index
const modalZ = tokens.zIndex.modal // 1040（TypeScript 可推断具体数值）
```

## 主题扩展

如需替换品牌色，只需修改 `variables.scss` 中的 `:root` 变量：

```scss
:root {
  --color-primary: #1890ff; // 替换为你的品牌色
}
```

暗黑模式下的覆盖在 `dark.scss` 的 `html.dark` 块中同步修改。

## 与 Figma 对接

推荐工作流：

1. 设计师在 Figma 中使用 **Figma Tokens** 插件管理 Token
2. 导出为 `tokens.json`
3. 使用 **Style Dictionary** 将 `tokens.json` 转换为 `variables.scss` 和 `tokens.ts`
4. 提交生成文件，CI 验证 Token 是否同步

```bash
# 将来集成 Style Dictionary 后的生成命令
pnpm run gen:tokens
```
