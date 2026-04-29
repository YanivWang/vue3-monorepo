# 错误处理与可观测性

## 错误分层（PC 管理端为模板最完整示例）

| 层级               | 处理方式                      | 说明                                                        |
| ------------------ | ----------------------------- | ----------------------------------------------------------- |
| HTTP 业务/网络错误 | Axios 响应拦截 + 各端 UI 反馈 | 与 `request-*` 装配一致                                     |
| 组件内可恢复错误   | `ErrorBoundary` 等包装组件    | 见组件文档 [ErrorBoundary](../components/error-boundary.md) |
| Vue 根组件外错误   | `app.config.errorHandler`     | 统一兜底                                                    |
| 全局 JS            | `window.onerror`              | 按插件注册顺序执行                                          |
| 未捕获 Promise     | `unhandledrejection`          | 与全局错误处理一并配置                                      |

**说明**：H5 与 PC 的插件组织方式可能不同，以各 `src/main.ts` / `plugins` 实际代码为准。架构详述见 [架构说明 — 异常处理](./architecture.md#异常处理)。

- **PC 管理端**：`setupErrorHandler`（`apps/pc/pc-admin-template/src/plugins/errorHandler.ts`）统一注册 Vue、全局、`unhandledrejection` 与静态资源加载失败；可通过 `setErrorReporter` 接入自建上报。
- **H5 模板**：`setupClientErrorReporting`、`reportClientError` 与 Web Vitals（`apps/h5/h5-template/docs/observability.md`）。

## 与 ErrorHandler 插件（PC）

`errorHandler` 插件中可**替换/扩展**「上报」实现（如接入自建日志接口）。默认实现以注释形式说明，生产环境可改为 `sendBeacon`、自有采集端点等。

**不要在错误回调中再次抛出未处理异常**，避免监控风暴。
