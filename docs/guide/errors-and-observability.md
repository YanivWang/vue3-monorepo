# 全局错误监控

## 错误分层（PC 管理端为模板最完整示例）

| 层级               | 处理方式                      | 说明                                                        |
| ------------------ | ----------------------------- | ----------------------------------------------------------- |
| HTTP 业务/网络错误 | Axios 响应拦截 + 各端 UI 反馈 | 与 `request-*` 装配一致                                     |
| 组件内可恢复错误   | `ErrorBoundary` 等包装组件    | 见组件文档 [ErrorBoundary](../components/error-boundary.md) |
| Vue 根组件外错误   | `app.config.errorHandler`     | 统一兜底                                                    |
| 全局 JS            | `window.onerror`              | 按插件注册顺序执行                                          |
| 未捕获 Promise     | `unhandledrejection`          | 与全局错误处理一并配置                                      |

**说明**：两端均通过共享包 `setupClientErrorReporting` 注册上述浏览器级监听；PC 在开发环境可额外用 Element Plus `ElMessage` 提示 Vue 运行时错误。以各 `src/main.ts` / `plugins` 实际代码为准。架构详述见 [架构说明 — 异常处理](./architecture.md#error-handling)。

- **PC 管理端**：`setupPlugins` 内调用 `setupClientErrorReporting`（`@vue3-monorepo/shared/web-monitor/client-error`），可选 `afterVueError` 与 H5 区分 DEV 提示；自建消费端可使用 `setErrorReporter`（`apps/pc/pc-admin-template/src/plugins/errorReporterCompat.ts`，将载荷映射为历史 `ErrorPayload` 形态）。
- **H5 模板**：同上共享实现；应用入口为 `setupClientErrorReporting(app)`。与 Web Vitals 分工见 [全局性能监控](./web-vitals.md)，实现备忘见 `apps/h5/h5-template/docs/observability.md`。

## 与 HTTP 上报

配置 `VITE_ERROR_REPORT_URL` 后，错误会以 JSON **POST** 到该地址（`sendBeacon` / `fetch` keepalive，与 Web Vitals 一致）。另可通过 `setAdditionalClientErrorListener`（共享包导出）或 PC 的 `setErrorReporter` 附加消费，**不要在回调中再次抛出未处理异常**，避免监控风暴。
