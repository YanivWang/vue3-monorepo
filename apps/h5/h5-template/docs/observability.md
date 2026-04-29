# H5 观测：Web Vitals 与前端错误

> 实现源码在 **`@vue3-monorepo/shared/web-monitor`**；本目录下 `src/plugins/webVitalsReport.ts`、`src/plugins/clientErrorReport.ts` 为 **re-export**，与 `main.ts` 启动顺序一致。

## 启动顺序（`main.ts`）

1. `collectWebVitals()`：注册 Web Vitals 监听（不依赖 Vue 实例）。
2. `createApp` 后调用 `setupClientErrorReporting(app)`。

`setupClientErrorReporting` 会**链式保留**创建应用前已存在的 `app.config.errorHandler`（若业务在注册本插件前自行设置过 handler）。

## Web Vitals

| 环境变量                     | 说明                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `VITE_WEB_VITALS_REPORT_URL` | 非空时向该 URL **POST** `application/json` 上报每条指标。                                                        |
| `VITE_WEB_VITALS_DEBUG`      | `true`：每条指标 `console.info`；`false`：即使开发环境也不打日志（仍会上报）；未配置时开发环境默认打印便于联调。 |

上报通道：优先 `navigator.sendBeacon`，否则 `fetch` + `keepalive: true`（与前端错误上报一致）。可在 URL 上挂 `?token=` 等与采集服务约定鉴权（见 `.env.example` 注释）。

## 前端错误（自研采集）

| 环境变量                  | 说明                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `VITE_ERROR_REPORT_URL`   | 非空时向该 URL **POST** JSON；空则只走 debug 日志（若开启），实际上报关闭。                                          |
| `VITE_ERROR_REPORT_DEBUG` | `true`：每条错误 `console.error('[ClientError]', payload)`；`false`：生产/预发可关闭；未配置时**开发环境**默认打印。 |
| `VITE_APP_VERSION`        | 可选，写入载荷 `appVersion`（与 Web Vitals 共用）。                                                                  |

### 自动采集范围

- **Vue**：`app.config.errorHandler`，`kind: 'vue'`，带 `vueInfo`（Vue 传入的 info 字符串）。
- **JS 运行时**：`window` 的 `error`（捕获阶段），`kind: 'js'`，含 `source` / `line` / `col` / `stack`（若可得）。
- **资源加载失败**：`IMG`、`SCRIPT`、`LINK`、`VIDEO`、`AUDIO`、`SOURCE`、`TRACK`、`OBJECT`、`EMBED`、`IFRAME` 等标签加载失败，`kind: 'resource'`，`source` 为资源 URL，`tagName` 为元素标签名。
- **未处理 Promise 拒绝**：`unhandledrejection`，`kind: 'unhandledrejection'`。

### 载荷字段（`ClientErrorPayload`）

| 字段           | 说明                                                |
| -------------- | --------------------------------------------------- |
| `kind`         | `vue` \| `js` \| `unhandledrejection` \| `resource` |
| `message`      | 错误信息或资源失败描述                              |
| `stack`        | 可选，过长会截断（约 16KB 上限）                    |
| `source`       | 脚本 URL 或资源 URL（资源类用）                     |
| `line` / `col` | 脚本错误行列（若有）                                |
| `tagName`      | 资源失败时的元素标签                                |
| `vueInfo`      | Vue errorHandler 的 info                            |
| `page`         | `pathname + search`                                 |
| `ts`           | 客户端毫秒时间戳                                    |
| `appVersion`   | 来自 `VITE_APP_VERSION`                             |
| `mode`         | `import.meta.env.MODE`                              |

手动上报可调用 `reportClientError()`（同上字段，省略 `ts` / `page` / `mode` / `appVersion`，由内部补全）。共享包另导出 `setAdditionalClientErrorListener`，用于与 HTTP 上报并行的附加消费。

开发环境若已配置上报地址，控制台会有一条提示：`上报已启用 → <url>`。

## 联调页面

`/dev/error-collect`（`src/views/dev/error-collect-test.vue`）可触发示例错误并验证控制台与上报行为。
