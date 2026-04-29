# 全局错误监控

## 错误分层（PC 管理端为模板最完整示例）

| 层级               | 处理方式                      | 说明                                                        |
| ------------------ | ----------------------------- | ----------------------------------------------------------- |
| HTTP 业务/网络错误 | Axios 响应拦截 + 各端 UI 反馈 | 与 `request-*` 装配一致                                     |
| 组件内可恢复错误   | `ErrorBoundary` 等包装组件    | 见组件文档 [ErrorBoundary](../components/error-boundary.md) |
| Vue 根组件外错误   | `app.config.errorHandler`     | 统一兜底                                                    |
| 全局 JS            | `window.onerror`              | 按插件注册顺序执行                                          |
| 未捕获 Promise     | `unhandledrejection`          | 与全局错误处理一并配置                                      |

**说明**：两端均通过共享包 **`WebMonitor.init`**（内部注册浏览器级监听与 Web Vitals）；PC 在 `main.ts` 传入 `afterVueError`，开发环境用 Element Plus `ElMessage` 提示 Vue 运行时错误。以各 `src/main.ts` / `plugins` 实际代码为准。架构详述见 [架构说明 — 异常处理](./architecture.md#error-handling)。

- **PC 管理端**：`main.ts` 在 `createApp` 后调用 `WebMonitor.init`（`@vue3-monorepo/shared/web-monitor`，展开 `webMonitorEnvFromVite()` 与 `afterVueError` 等）。如需附加上报消费，使用共享包导出 `setAdditionalClientErrorListener`（载荷为 `ClientErrorPayload`）。
- **H5 模板**：`main.ts` 使用 `WebMonitor.init({ app, ...webMonitorEnvFromVite() })`。与 Web Vitals 分工见 [全局性能监控](./web-vitals.md)，实现备忘见 `apps/h5/h5-template/docs/observability.md`。

## 与 HTTP 上报

应用层在 `main.ts` 将 `VITE_ERROR_REPORT_URL`（及 `clientErrorDebug` 等）并入 `WebMonitor.init` 后，共享 SDK 才会向该地址以 JSON **POST**（`sendBeacon` / `fetch` keepalive，与 Web Vitals 一致）。另可通过 **`setAdditionalClientErrorListener`**（共享包导出，**`ClientErrorPayload`**）附加消费，**不要在回调中再次抛出未处理异常**，避免监控风暴。
