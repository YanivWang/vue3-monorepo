# ErrorBoundary 错误边界

当子组件树发生未处理的渲染错误时，展示降级 UI 而非整个应用崩溃。

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

## 与全局错误处理的区别

| 场景                       | 处理方式                                                   |
| -------------------------- | ---------------------------------------------------------- |
| 组件渲染错误（可降级）     | 使用 `ErrorBoundary` 包裹                                  |
| 全局 JS 错误               | `window.onerror`（已在 `errorHandler.ts` 中注册）          |
| 未捕获 Promise             | `unhandledrejection`（已在 `errorHandler.ts` 中注册）      |
| Vue 组件树错误（全局兜底） | `app.config.errorHandler`（已在 `errorHandler.ts` 中注册） |

## 接入错误监控

`src/plugins/errorHandler.ts` 暴露了 `setErrorReporter` 方法，可替换默认的上报实现：

```ts
// main.ts 或独立的监控初始化文件
import { setErrorReporter } from '@/plugins/errorHandler'
import * as Sentry from '@sentry/vue'

setErrorReporter(payload => {
  Sentry.captureException(new Error(payload.message), {
    extra: { type: payload.type, info: payload.info }
  })
})
```

## 源码位置

`src/components/ErrorBoundary/index.vue`  
`src/plugins/errorHandler.ts`
