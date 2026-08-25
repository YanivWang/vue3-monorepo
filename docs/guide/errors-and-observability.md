# 全局错误监控

## 错误分层（PC 管理端为模板最完整示例）

| 层级               | 处理方式                                    | 说明                                                                        |
| ------------------ | ------------------------------------------- | --------------------------------------------------------------------------- |
| HTTP 业务/网络错误 | Axios 响应拦截 + 各端 UI 反馈               | 与 `request-*` 装配一致                                                     |
| 组件内可恢复错误   | `ErrorBoundary` 等包装组件                  | 见组件文档 [ErrorBoundary](../components/error-boundary.md)                 |
| Vue 根组件外错误   | `app.config.errorHandler`                   | 统一兜底                                                                    |
| 全局 JS / 资源加载 | `window.addEventListener('error', …, true)` | 捕获阶段监听；`target` 命中 IMG/SCRIPT/LINK 等标签时记为 `kind: 'resource'` |
| 未捕获 Promise     | `unhandledrejection`                        | 与全局错误处理一并配置                                                      |

**说明**：两端均通过 **`@vue3-monorepo/web-monitor`** 的 **`WebMonitor.init`**（内部注册浏览器级监听与 Web Vitals）；PC 在 `main.ts` 传入 `afterVueError`，开发环境用 Element Plus `ElMessage` 提示 Vue 运行时错误。以各 `src/main.ts` / `plugins` 实际代码为准。架构详述见 [架构说明 — 异常处理](./architecture.md#error-handling)。

- **两端一致**：`main.ts` 在 `createApp` 之后调用 `WebMonitor.init(buildWebMonitorInit(app, …))`。`buildWebMonitorInit(app, fields)` 是包内导出的小工具，用于把 `app` 与 `WebMonitorInitEnvFields` 合成入参——`WebMonitorInitOptions` 是联合类型，直接对象展开会让 TS 推断失准，因此**不要**写成 `WebMonitor.init({ app, ...fields })`。
- **PC 管理端**：额外传 `afterVueError`，DEV 下用 Element Plus `ElMessage` 提示 Vue 运行时错误。
- **H5 模板**：`WebMonitor.init(buildWebMonitorInit(app, webMonitorEnvFromVite()))`。与 Web Vitals 分工见 [全局性能监控](./web-vitals.md)，实现备忘见 `apps/h5/h5-template/docs/observability.md`。
- 如需附加上报消费，使用 **`@vue3-monorepo/web-monitor`** 导出的 `setAdditionalClientErrorListener`（载荷为 `ClientErrorPayload`）。

## 与 HTTP 上报

应用层在 `main.ts` 将 `VITE_ERROR_REPORT_URL`（及 `clientErrorDebug` 等）并入 `WebMonitor.init` 后，`@vue3-monorepo/web-monitor` 才会向该地址以 JSON **POST**（`sendBeacon` / `fetch` keepalive，与 Web Vitals 一致）。另可通过 **`setAdditionalClientErrorListener`**（同包导出，**`ClientErrorPayload`**）附加消费，**不要在回调中再次抛出未处理异常**，避免监控风暴。
