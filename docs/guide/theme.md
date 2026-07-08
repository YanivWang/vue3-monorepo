# 主题与品牌切换

**共享层**：Token 与运行时 API 出自 `@vue3-monorepo/shared`。**PC（Element Plus `--el-*`）与 H5（Vant 变量映射）**为两条**并列**接入线，下文分端说明时不表示另一端次要。

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
import {
  applyBrand,
  applyThemeMode,
  brandPalettes,
  getAppliedBrand,
  getAppliedThemeMode,
  type BrandId
} from '@vue3-monorepo/shared/styles/tokens'
```

### Composable：`createUseTheme` / `createUseThemeH5`

若页面或子应用**不想依赖 Pinia**，可用共享包提供的工厂，在自定义 `ThemeStorage`（`get` / `set` / 可选 `remove`）上挂载品牌与深浅模式，内部仍调用 `applyBrand` / `applyThemeMode`：

- **`@vue3-monorepo/shared/hooks-core`**：`createUseTheme(ctx)` → 返回 `useTheme()`，在组件 `setup` 中调用；`resolvedMode` 在 `mode === 'system'` 且仅操作系统配色变化时**不会**自动递增（与 store 的 `themeTick` 策略不同，详见源码注释）。
- **`@vue3-monorepo/shared/hooks-h5`**：`createUseThemeH5({ storage, locale?, ... })`，在 `createUseTheme` 基础上可选 `watch` 语言并同步 `VantLocale`。

模板默认仍以 **`useAppStore`** 为准：PC 在 **`App.vue`** 调用 `appStore.init()`；H5 在 **`main.ts`** 于 `mount` 前调用 `useAppStore().init()`。

## 模板中的入口（PC Admin）

| 位置                                       | 说明                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `views/layout/components/LayoutHeader.vue` | 顶栏右侧：**品牌色圆点 + 下拉**，以及 **主题图标 + 下拉**（浅色 / 深色 / 跟随系统） |
| `views/login/index.vue`                    | 登录页右上：**品牌色 + 主题**下拉；**未登录**也可切换，便于预览样式                 |

二者均调用 `useAppStore().setBrand` / `setTheme`，与 [应用 Store](./architecture.md#state-management) 中 `app` 的持久化逻辑一致（Pinia `persist` 路径含 `themeMode` 与 `brand` 等，以各应用 `app` store 为准）。

`setTheme` 会：

1. 通过持久化插件写入本地存储（具体 key 由插件配置）
2. 在 `<html>` 上添加/移除 `.dark` class（内部调用 `applyThemeMode`）
3. 在 `system` 模式下注册 `prefers-color-scheme` 监听；store 内另有 `themeTick` 以便 Vue 计算属性在系统配色变化时更新

## CSS 变量体系（源码位置）

亮色默认值来自 **`tokens/_variables.scss`** → **`_root.scss`**；品牌覆盖在 **`_brands.scss`**（`html[data-brand]`，blue 用 `:root` 默认）；业务暗黑在 **`_dark.scss`**（`html.dark`）。

| 端     | 全局样式入口                   | 引入方式                                                                                   |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------ |
| **PC** | `src/assets/styles/index.scss` | `@use` 共享 `tokens/index.scss`（含 `_dark-element.scss`）+ `patterns/index.scss`          |
| **H5** | `src/styles/index.scss`        | `@use` 共享 `tokens/index.scss` + `patterns/index.scss`；Vant 变量映射到同一套 `--color-*` |

各端 `vite.config` 的 **`additionalData`** 注入 `@use "@vue3-monorepo/shared/styles/tokens/variables" as *;`，SFC 内可直接使用 `$spacing-md`、`$layout-sidebar-width` 等。

品牌色单源：**`packages/shared/src/styles/theme-palette.json`**。运行 `pnpm generate:theme` 生成 `brands.config.ts` 与 `_brands.scss`。

```scss
/* shared：_root.scss → :root { --color-bg-page: … } */
/* shared：_brands.scss → html[data-brand='green'] { --color-primary: … } */
/* shared：_dark.scss → html.dark { --color-bg-page: … } */
/* shared：_dark-element.scss → html.dark { --el-*: var(--color-*) … } */
```

在组件中使用 CSS 变量：

```scss
.my-component {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
}
```

## Element Plus 暗黑模式

`main.ts` 中在 **`element-plus/dist/index.css` 之后**、**应用全局 `index.scss` 之前**引入官方暗色变量：

```ts
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/styles/index.scss'
```

结合 `html.dark` 类与共享 `_dark-element.scss` 中的 `--el-*` 覆盖，组件与业务变量一并进入暗黑外观。

## 完整变量列表（节选）

| 变量名                   | 亮色值    | 暗色值    | 说明          |
| ------------------------ | --------- | --------- | ------------- |
| `--color-bg-page`        | `#f0f2f5` | `#0d0d0d` | 页面背景      |
| `--color-bg-surface`     | `#ffffff` | `#141414` | 表面背景      |
| `--color-bg-elevated`    | `#ffffff` | `#1d1e20` | 卡片/抬升背景 |
| `--color-text-primary`   | `#303133` | `#e5eaf3` | 主要文字      |
| `--color-text-regular`   | `#606266` | `#cfd3dc` | 常规文字      |
| `--color-text-secondary` | `#909399` | `#a3a6ad` | 次要文字      |
| `--color-border-default` | `#dcdfe6` | `#3c3c3c` | 边框          |
| `--layout-sidebar-bg`    | `#001529` | `#141414` | 侧栏背景      |
| `--layout-header-bg`     | `#ffffff` | `#1d1e20` | 顶栏背景      |
