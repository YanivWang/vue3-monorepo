# ErrorBoundary 错误边界

当子组件树发生未处理的渲染错误时，展示降级 UI 而非整个应用崩溃。

下文 **`ErrorBoundary`** 指 **PC 管理端**从 `@vue3-monorepo/shared/components-pc` 暴露的组件（模板中经 `installComponents` 全局注册）。**H5** 请使用 **`ErrorBoundaryH5`**（`@vue3-monorepo/shared/components-h5`），源码在 `packages/shared/src/components-h5/ErrorBoundaryH5/`。

## 基础用法

```vue
<template>
  <ErrorBoundary>
    <RiskyComponent />
  </ErrorBoundary>
</template>
```

## 自定义标题

```vue
<template>
  <ErrorBoundary title="图表加载失败">
    <ChartComponent />
  </ErrorBoundary>
</template>
```

## 工作原理

内部使用 Vue 的 `onErrorCaptured` 钩子捕获子树中的错误：

- 发生错误 → 显示降级 UI（El-Result 错误图）
- 点击"重试" → 重置错误状态，重新渲染子树
- 错误不会继续向上传播

## Props

| 属性    | 类型     | 默认值           | 说明               |
| ------- | -------- | ---------------- | ------------------ |
| `title` | `string` | `'页面出现错误'` | 降级 UI 的标题文字 |

## 与全局错误处理的区别（以 PC 管理端模板为准）

| 场景                       | 处理方式                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| 组件渲染错误（可降级）     | 使用 `ErrorBoundary` 包裹                                          |
| 全局 JS 错误               | `window.onerror`（已在 PC 模板 `errorHandler.ts` 中注册）          |
| 未捕获 Promise             | `unhandledrejection`（已在 PC 模板 `errorHandler.ts` 中注册）      |
| Vue 组件树错误（全局兜底） | `app.config.errorHandler`（已在 PC 模板 `errorHandler.ts` 中注册） |

H5 模板的错误与性能采集见 [全局错误监控](../guide/errors-and-observability.md)、`apps/h5/h5-template/docs/observability.md`。

## 接入错误监控

**PC 管理端模板**中 `apps/pc/pc-admin-template/src/plugins/errorHandler.ts` 暴露了 `setErrorReporter` 方法，可替换默认的上报实现：

```ts
// main.ts 或独立的监控初始化文件
import { setErrorReporter } from '@/plugins/errorHandler'

setErrorReporter(payload => {
  void fetch('/api/error-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
})
```

实际端点与安全策略（鉴权、脱敏）由团队与后端约定。

## 源码位置

- PC 边界组件：`packages/shared/src/components-pc/ErrorBoundary/index.vue`
- PC 全局错误插件：`apps/pc/pc-admin-template/src/plugins/errorHandler.ts`
