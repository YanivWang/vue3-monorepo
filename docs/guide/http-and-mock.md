# HTTP 与 Mock

## 共享请求层

Monorepo 在 `packages/shared` 中按端拆分请求封装，避免业务与 UI 强耦合：

- **`request-core`**：Axios 能力核心，**禁止**依赖 Element Plus / Vant；与 `check:request-core` 检查一致（见 [质量门禁与脚本](./quality-gates.md)）。
- **`request-pc`**：PC 端 `createPcHttp` 等，默认使用 Element 类反馈，供 admin 使用。
- **`request-h5`**：H5 用 `createH5Http` 等，在 `src/plugins/http.ts` 等位置装配。

业务侧在各自 app 的 `src/utils/http` 或插件中组合拦截器、Token、Loading 等。PC 端更细的拦截器、取消重复请求（`cancelDuplicate`）等见 [架构说明 — HTTP 层](./architecture.md#http-层-utils-http)（`apps/pc/pc-admin-template` 路径以仓库为准）。

## Mock

- 通过环境变量 **`VITE_USE_MOCK`** 控制是否走内建 mock；开发时可为 `true`，**生产环境宜 `false`**。详见 [环境变量说明](./environment-variables.md)。
- Mock 数据通常位于各应用 `mock/` 目录，与 Vite 插件或约定式路由配合；**不要**在 mock 中写入真实 token 或内网地址。

## 与代理、环境的关系

- 开发时接口地址常由 `VITE_API_BASE_URL` + `VITE_API_PREFIX` 与 Vite `server.proxy` 共同决定；发版/容器场景见 [部署说明](./deploy.md) 与 nginx 样例。
