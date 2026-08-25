# @vue3-monorepo/h5

H5 移动端应用（Vant 4 + 多宿主：浏览器 / 微信小程序 WebView / 支付宝小程序 WebView / 原生 APP WebView）

> **本目录是 monorepo 内的 H5 应用模板**（`pnpm run create-app` 的复制源）。**请勿在此编写业务功能**；请在仓库根执行 `pnpm run create-app` 生成业务应用后再开发，说明见 [新增业务应用](../../../docs/guide/adding-a-new-app.md)。

## 目录概要

```
apps/h5/h5-template/
├── src/                    # 入口、路由、页面、stores、API、plugins（HTTP、错误与 Web Vitals 等）
├── docs/                   # 协议与观测说明（如 WebView Bridge、前端观测）
├── mock/
├── public/
├── .env.development        # 本地开发（默认开 mock）
├── .env.docker             # compose 默认构建模式（同源 /api，nginx 反代）
├── .env.example            # 变量清单样例，按需复制为 .env.production 等
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

生产级 **Docker / nginx** 与仓库对齐：见 **`docker/images/h5/Dockerfile`**、**`docker/nginx/h5.conf`**、根 [部署文档](../../../docs/guide/deploy.md)。

## 测试

在仓库根：`pnpm run h5:test` 或 `pnpm run test`（根 Vitest workspace 含本包）。单测文件约定为 `src/**/*.spec.ts`。

## 路由栈式 keep-alive（手工回归）

自动化单测见 **`packages/shared/src/hooks-h5/useHistoryStackH5.spec.ts`**。发版前建议在浏览器再确认：

1. 登录后 **Home → List → Theme**，使用系统返回或页面返回：**栈顶弹出**，`KeepAlive` 缓存符合预期（中间页是否销毁与业务一致）。
2. 在 **List** 使用 **`router.replace`** 进入同级页：**栈顶替换**，不应多叠一层（与 **`replace` + History `replaceState`** 一致）。
3. **未登录**访问 `requiresAuth` 路由：应先被鉴权守卫重定向 **Login**，确认 **`setupRouterGuards` 中鉴权先于 `useHistoryStackH5.bind`**，错误路径不会入栈。

## 观测与报错

- **Web Vitals**：`VITE_WEB_VITALS_*` 在 **`src/main.ts`** 的 `webMonitorEnvFromVite()` 中并入 `WebMonitor.init`（`@vue3-monorepo/web-monitor`）。
- **前端错误采集**：`VITE_ERROR_REPORT_*` 同上。采集 Vue 错误、JS 运行时错误、资源加载失败、`unhandledrejection`（`WebMonitor.init` 注册的 `errorHandler` 会先调用应用原有 handler）。

环境与载荷细节见 **`docs/observability.md`**；开发联调可走 **`/dev/error-collect`**。
