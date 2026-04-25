# @vue3-mono/components-pc

PC 端共享业务组件库，基于 Element Plus 生态。

## 组件清单

| 组件            | 说明                                                           |
| --------------- | -------------------------------------------------------------- |
| `ErrorBoundary` | 错误边界：捕获子组件异常并降级显示（配合 `ElResult`）          |
| `PageContainer` | 页面容器：标题 / 副标题 / extra 操作区 + 默认内容插槽          |
| `ProTable`      | 高级表格：搜索区 + 工具栏 + `ElTable` + 分页，集成 `useTable`  |
| `Skeleton`      | 骨架屏：list / card / avatar 三种变体，支持闪光动画            |
| `SvgIcon`       | SVG 图标：支持本地 symbol（`vite-plugin-svg-icons`）+ 外部 URL |

## 使用

全量安装：

```ts
import { createApp } from 'vue'
import VMonoPC, { installComponents } from '@vue3-mono/components-pc'
import App from './App.vue'

const app = createApp(App)
installComponents(app) // 或 app.use(VMonoPC)
```

按需导入：

```ts
import { ErrorBoundary, ProTable, PageContainer } from '@vue3-mono/components-pc'

export default {
  components: { ErrorBoundary, ProTable, PageContainer }
}
```

## 样式

组件内部 SCSS 通过 `@use '@vue3-mono/shared/styles/tokens/variables' as *;` 引入设计 token（SCSS 变量），**不产生额外全局 CSS 输出**。

暗黑模式 / `:root` CSS 变量建议在应用入口一次性引入：

```scss
// apps/admin/src/styles/index.scss
@use '@vue3-mono/shared/styles/tokens/root';
@use '@vue3-mono/shared/styles/tokens/dark';
```

## 依赖

- peer：`vue`、`element-plus`、`@element-plus/icons-vue`、`@vueuse/core`
- workspace：`@vue3-mono/shared`、`@vue3-mono/hooks`、`@vue3-mono/utils`

## 构建

`pnpm --filter @vue3-mono/components-pc build` 基于 Vite 产出 ES 模块（`preserveModules: true`）+ 单独抽出 CSS 文件（`cssCodeSplit: true`，输出到 `dist/styles/`）。
