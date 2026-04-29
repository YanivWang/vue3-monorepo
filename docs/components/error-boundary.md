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

| 场景                       | 处理方式                                                             |
| -------------------------- | -------------------------------------------------------------------- |
| 组件渲染错误（可降级）     | 使用 `ErrorBoundary` 包裹                                            |
| 全局 JS 错误               | `window` `error` 捕获阶段（`setupClientErrorReporting`，共享包实现） |
| 未捕获 Promise             | `unhandledrejection`（同上）                                         |
| Vue 组件树错误（全局兜底） | `app.config.errorHandler`（同上；PC DEV 下额外 `ElMessage`）         |

H5 模板的错误与性能采集见 [全局错误监控](../guide/errors-and-observability.md)、`apps/h5/h5-template/docs/observability.md`。

## 接入错误监控

**优先**在环境变量中配置 `VITE_ERROR_REPORT_URL`（与 H5 相同，见 [全局错误监控](../guide/errors-and-observability.md)）。

**PC 管理端模板**另提供 `setErrorReporter`（源码 `apps/pc/pc-admin-template/src/plugins/errorReporterCompat.ts`），在历史字段形态 `ErrorPayload`（`type: vue | global | promise | resource`）上附加消费，与 HTTP 上报并行而非替代：

```ts
import { setErrorReporter } from '@/plugins/errorReporterCompat'

setErrorReporter(payload => {
  // 自定义：日志、第三方 SDK 等
  console.info('[extra]', payload)
})
```

实际端点与安全策略（鉴权、脱敏）由团队与后端约定。

## 源码位置

- PC 边界组件：`packages/shared/src/components-pc/ErrorBoundary/index.vue`
- PC 兼容层（可选附加上报）：`apps/pc/pc-admin-template/src/plugins/errorReporterCompat.ts`
- 共享实现：`packages/shared/src/web-monitor/clientErrorReport.ts`
