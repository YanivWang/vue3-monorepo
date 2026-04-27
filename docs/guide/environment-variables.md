# 环境变量

Vite 仅加载**各应用自己目录**下的 `.env`、`.env.local`、`.env.[mode]` 等。客户端可注入打包产物的变量**必须以 `VITE_` 为前缀**（勿把密钥写进可公开的前端变量）。

## 通用（PC / H5 对齐部分）

以各端 `.env.example` 为**与代码同步的样例**；下表为语义说明。具体默认值、是否在某模式加载请以示例文件和 Vite 文档为准。

| 变量                                        | 说明                                                       |
| ------------------------------------------- | ---------------------------------------------------------- |
| `VITE_APP_TITLE`                            | 应用标题、文档标题等                                       |
| `VITE_API_BASE_URL`                         | 接口基地址，如 `http://localhost:3000`                     |
| `VITE_API_PREFIX`                           | 请求路径前缀，常与代理一致，如 `/api`                      |
| `VITE_TOKEN_KEY` / `VITE_REFRESH_TOKEN_KEY` | 存于 Cookie 的 access / refresh 键名                       |
| `VITE_API_SUCCESS_CODE`                     | 与后端约定的业务成功码，如 `200` 或 `0`                    |
| `VITE_USE_MOCK`                             | `true` 时使用内建 mock；生产环境宜 `false`                 |
| `VITE_ANALYZE`                              | 构建分析相关开关（与打包分析脚本/插件配合，见各 app 配置） |
| `VITE_SOURCEMAP`                            | 是否生成 sourcemap（生产策略由团队定）                     |

## H5 可选

| 变量                     | 说明                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `VITE_H5_VIEWPORT_WIDTH` | 移动端视口基准宽度，常见 `375`（与 `postcss-mobile-forever` 等配合） |

## 监控（可选，以源码为准）

PC / H5 的 Sentry 集成使用如下变量（若未在 `.env.example` 中列出，以 `src/plugins/sentry.ts` 等文件注释为准）：

| 变量              | 说明                                  |
| ----------------- | ------------------------------------- |
| `VITE_SENTRY_DSN` | Sentry 项目 DSN，未配置则跳过初始化   |
| `VITE_SENTRY_ENV` | 环境名，默认随 `import.meta.env.MODE` |

## 样例文件位置

- [apps/pc/pc-admin-template/.env.example](https://github.com/YanivWang/vue3-monorepo/blob/main/apps/pc/pc-admin-template/.env.example)
- [apps/h5/h5-template/.env.example](https://github.com/YanivWang/vue3-monorepo/blob/main/apps/h5/h5-template/.env.example)

请复制为 `.env.development`、`.env.production` 等后按需修改，**不要提交**含密钥或内网地址的私有 `.env*`。

## 与文档站、CI 的关系

- 文档站（本包）的构建环境变量见 [CI 与自动化](./ci-and-automation.md)（如 `VITEPRESS_BASE`）。
- 各应用代理与 Mock 还涉及 Vite `server.proxy` 与 `VITE_USE_MOCK`；细节见 [HTTP 与 Mock](./http-and-mock.md)。
