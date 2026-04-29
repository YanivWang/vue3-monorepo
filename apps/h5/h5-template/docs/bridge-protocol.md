# H5 Bridge 与 WebView

> 与 iOS / Android 客户端共维。`@vue3-monorepo/shared/js-bridge` 的 `native-app` 策略依赖客户端注入的全局对象与 `postMessage` 约定；以下为业务对齐用的**最小协议说明**，详细字段以各端 SDK 为准。

## 1. 注入与发现

- 客户端在 WebView `onPageFinished` 后注入 JS Bridge（或约定全局名，如 `window.__APP_BRIDGE__`）。
- H5 通过 `detectHost()` 识别为 `native-app` 后，走 `createNativeAppStrategy` 封装的方法；**不得**在业务页直接访问未文档化的全局变量。

## 2. 能力清单（与 `BridgeAbility` 对齐）

| 能力域     | 示例 ability id   | 说明                                                   |
| ---------- | ----------------- | ------------------------------------------------------ |
| navigation | `navigation.back` | 关闭 WebView 或返回上一级                              |
| auth       | `auth.login`      | 唤起原生登录 / SSO，返回 `credential` 供 H5 `exchange` |
| storage    | `storage.get`     | 与客户端约定 key 命名空间，避免与 H5 localStorage 冲突 |
| ui         | `ui.toast`        | 可选：统一原生 Toast                                   |

未实现能力应返回结构化错误（见 `BridgeError`），H5 侧可降级为 Vant 提示或表单流程。

## 3. 登录与凭证

1. H5 调用 `bridge.auth.login()`。
2. 原生完成授权后，通过 Bridge 回调 **credential**（如 SSO token 或临时票据）。
3. H5 调用后端 `/api/auth/exchange`（或业务约定接口）换取 `accessToken` / `refreshToken`，并写入本应用 `tokenStorage`（与 admin 的存储隔离）。

## 4. 安全

- 敏感 token 优先由客户端托管时，H5 仅持短期 access token。
- `postMessage` 需校验 origin / 签名（由客户端实现）。
- 生产环境关闭 Mock；多宿主联调时小程序 / App WebView 应直连真实网关，不依赖 dev server mock。

## 5. 变更流程

- 协议变更需同步更新本文档版本号与 `@vue3-monorepo/shared/js-bridge` 类型定义。
- 破坏性变更需发迁移说明给 H5 与双端负责人。

## 相关文档

- H5 端 Web Vitals 与自研错误上报的环境变量与载荷说明见 [observability.md](./observability.md)。
