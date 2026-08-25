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
| `VITE_APP_VERSION`                          | 可选版本号，作为 `release` 写入观测载荷的 `appVersion`     |

各端 `src/types/env.d.ts` 里有**逐条带注释**的声明，是最贴近代码的清单。

## PC Admin 专有

| 变量                | 说明                                                       |
| ------------------- | ---------------------------------------------------------- |
| `VITE_REFRESH_PATH` | Token 刷新接口路径（相对 `baseURL`），默认 `/auth/refresh` |

## H5 可选

| 变量                             | 说明                                                                 |
| -------------------------------- | -------------------------------------------------------------------- |
| `VITE_H5_VIEWPORT_WIDTH`         | 移动端视口基准宽度，常见 `375`（与 `postcss-mobile-forever` 等配合） |
| `VITE_H5_SHOW_ERROR_REPORT_TEST` | `true` 时在「我的」页显示进入 `/dev/error-collect` 的联调入口        |

## 观测（PC / H5 通用）

两端 `main.ts` 的 `webMonitorEnvFromVite()` 会读取下列变量并传给 `WebMonitor.init`：

| 变量                                                             | 说明                                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `VITE_WEB_VITALS_REPORT_URL` / `VITE_ERROR_REPORT_URL`           | 两类载荷的 JSON POST 地址；开启对应能力时**必填非空**          |
| `VITE_WEB_VITALS_DEBUG` / `VITE_ERROR_REPORT_DEBUG`              | `true` 打印；`false` 即使 DEV 也不打；**未设**时 DEV 默认打印  |
| `VITE_WEB_MONITOR_WEB_VITALS` / `VITE_WEB_MONITOR_CLIENT_ERRORS` | 置为 `'false'` 时关闭对应 `integrations`；未设或其它值保持开启 |

更多字段与载荷说明见 [apps/h5/h5-template/.env.example](https://github.com/YanivWang/vue3-monorepo/blob/main/apps/h5/h5-template/.env.example) 与 [H5 观测文档](https://github.com/YanivWang/vue3-monorepo/blob/main/apps/h5/h5-template/docs/observability.md)（自建上报链路）。

## 样例文件位置

- [apps/pc/pc-admin-template/.env.example](https://github.com/YanivWang/vue3-monorepo/blob/main/apps/pc/pc-admin-template/.env.example)
- [apps/h5/h5-template/.env.example](https://github.com/YanivWang/vue3-monorepo/blob/main/apps/h5/h5-template/.env.example)

请复制为 `.env.development`、`.env.production` 等后按需修改，**不要提交**含密钥或内网地址的私有 `.env*`。

## 与文档站、CI 的关系

- 文档站（本包）的构建环境变量见 [CI 与自动化](./ci-and-automation.md)（如 `VITEPRESS_BASE`）。
- 各应用代理与 Mock 还涉及 Vite `server.proxy` 与 `VITE_USE_MOCK`；细节见 [HTTP 请求控制，数据 Mock](./http-and-mock.md)。
