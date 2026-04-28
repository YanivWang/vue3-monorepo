# 主题、暗黑与品牌色

## 三种主题模式

| 模式     | 说明                                                   |
| -------- | ------------------------------------------------------ |
| `light`  | 强制亮色模式                                           |
| `dark`   | 强制暗黑模式                                           |
| `system` | 跟随操作系统偏好，监听 `prefers-color-scheme` 媒体查询 |

## 切换深浅模式

```ts
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

// 切换到暗黑模式
appStore.setTheme('dark')

// 跟随系统
appStore.setTheme('system')
```

与路由、指令等处对齐时，可使用 **`@vue3-monorepo/shared`** 中的枚举（值为 `'light' | 'dark' | 'system'`），避免魔法字符串：

```ts
import { ThemeMode } from '@vue3-monorepo/shared/enums'

appStore.setTheme(ThemeMode.DARK)
```

在模板里与 `appStore.themeMode` 比较时同样可写 `ThemeMode.LIGHT` 等（PC 模板中 `LayoutHeader`、`views/login` 已按此实现）。

## 品牌色（多套预设）

品牌色与深浅模式独立：`BrandId` 与 `brandPalettes` 定义在 `@vue3-monorepo/shared/styles/tokens`，运行时 `applyBrand(id)` 会设置 `document.documentElement` 的 `data-brand`，由共享包 `_brands.scss` 覆盖 `--color-primary` 等变量。

```ts
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

appStore.setBrand('green')
```

业务侧亦可直接使用共享 API（例如在不经由 Pinia 的场景）：

```ts
import { applyBrand, brandPalettes, type BrandId } from '@vue3-monorepo/shared/styles/tokens'
```

## 模板中的入口（PC Admin）

| 位置                                       | 说明                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `views/layout/components/LayoutHeader.vue` | 顶栏右侧：**品牌色圆点 + 下拉**，以及 **主题图标 + 下拉**（浅色 / 深色 / 跟随系统） |
| `views/login/index.vue`                    | 登录页右上：**品牌色 + 主题**下拉；**未登录**也可切换，便于预览样式                 |

二者均调用 `useAppStore().setBrand` / `setTheme`，与 [应用 Store](./architecture.md#状态管理) 中 `app` 的持久化逻辑一致（Pinia `persist` 路径含 `themeMode` 与 `brand` 等，以各应用 `app` store 为准）。

`setTheme` 会：

1. 通过持久化插件写入本地存储（具体 key 由插件配置）
2. 在 `<html>` 上添加/移除 `.dark` class（内部调用 `applyThemeMode`）
3. 在 `system` 模式下注册 `prefers-color-scheme` 监听；store 内另有 `themeTick` 以便 Vue 计算属性在系统配色变化时更新

## CSS 变量体系（源码位置）

亮色默认值与映射来自 **`packages/shared/src/styles/tokens/_root.scss`**（基于同目录 **`_variables.scss`** 中的 Sass 变量）；品牌覆盖在 **`_brands.scss`**（`html[data-brand='…']`）。

PC 管理端模板在全局样式入口 **`src/assets/styles/index.scss`** 中 `@use` 上述共享 `root`、`brands`，再 `@use` 本应用 **`src/assets/styles/dark.scss`**，用于业务侧暗黑覆盖及 Element Plus 暗黑变量对齐。

```scss
/* 语义与数值以仓库内文件为准；以下为结构示意 */
/* shared：_root.scss → :root { --bg-page: … } */
/* shared：_brands.scss → html[data-brand='green'] { --color-primary: … } */
/* PC 应用：dark.scss → html.dark { --bg-page: …; … } */
```

业务模板中的 **`src/assets/styles/variables.scss`**（若仍存在）为可选对照文件：`$*` 与各 `--*` 的实际构建注入来自共享包 **`tokens/variables`**（见各端 `vite.config` `additionalData`），并非默认 `@use` 该本地路径。

在组件中使用 CSS 变量：

```scss
.my-component {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

## Element Plus 暗黑模式

`main.ts` 中在 **`element-plus/dist/index.css` 之后**、**应用全局 `index.scss` 之前**引入官方暗色变量：

```ts
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/styles/index.scss'
```

结合 `html.dark` 类与应用内 `dark.scss` 中的 `--el-*` 覆盖，组件与业务变量一并进入暗黑外观。

## 完整变量列表

| 变量名             | 亮色值    | 暗色值    | 说明            |
| ------------------ | --------- | --------- | --------------- |
| `--bg-page`        | `#f0f2f5` | `#0d0d0d` | 页面背景        |
| `--bg-white`       | `#ffffff` | `#141414` | 卡片/内容区背景 |
| `--bg-card`        | `#ffffff` | `#1d1e20` | 卡片背景        |
| `--text-primary`   | `#303133` | `#e5eaf3` | 主要文字        |
| `--text-regular`   | `#606266` | `#cfd3dc` | 常规文字        |
| `--text-secondary` | `#909399` | `#a3a6ad` | 次要文字        |
| `--border-color`   | `#dcdfe6` | `#3c3c3c` | 边框颜色        |
| `--sidebar-bg`     | `#001529` | `#141414` | 侧边栏背景      |
| `--header-bg`      | `#ffffff` | `#1d1e20` | 顶栏背景        |
