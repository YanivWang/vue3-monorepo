# H5 观测：Web Vitals 与前端错误

> 实现源码仅在 **`@vue3-monorepo/shared/web-monitor`**；入口为 **`WebMonitor.init`**。本应用在 **`src/main.ts`** 内用 `webMonitorEnvFromVite()` 从 `import.meta.env` 装配参数后调用。

## 启动顺序（`main.ts`）

在 **`createApp` 之后尽快** 调用一次：

```ts
import { WebMonitor, type WebMonitorInitEnvFields } from '@vue3-monorepo/shared/web-monitor'

function webMonitorEnvFromVite(): WebMonitorInitEnvFields {
  return {
    errorReportUrl: import.meta.env.VITE_ERROR_REPORT_URL,
    webVitalsReportUrl: import.meta.env.VITE_WEB_VITALS_REPORT_URL,
    release: import.meta.env.VITE_APP_VERSION,
    environment: import.meta.env.MODE,
    clientErrorDebug:
      import.meta.env.VITE_ERROR_REPORT_DEBUG === 'true' ||
      (import.meta.env.DEV && import.meta.env.VITE_ERROR_REPORT_DEBUG !== 'false'),
    webVitalsDebug:
      import.meta.env.VITE_WEB_VITALS_DEBUG === 'true' ||
      (import.meta.env.DEV && import.meta.env.VITE_WEB_VITALS_DEBUG !== 'false')
  }
}

// …
WebMonitor.init({ app, ...webMonitorEnvFromVite() })
```

共享包不读取环境变量；装配方式可与上例不同，由集成方自行决定。

`WebMonitor.init` **内部顺序**：先注册 Web Vitals（`onFCP` / `onLCP` 等），再注册 Vue `errorHandler` 与 `window` 级监听。链式保留创建应用前已存在的 `app.config.errorHandler`（若业务在 `init` 前自行设置过 handler）。

### 可选配置（与 Sentry `init` 心智类似）

- `errorReportUrl` / `webVitalsReportUrl`：JSON POST 地址；**默认同时开启错误 + Web Vitals 时二者均为必填**（非空字符串）。若 `integrations.webVitals === false` 或 `integrations.clientErrors === false` 可只保留开启侧 URL；两侧均关时不要求 URL。
- `clientErrorDebug` / `webVitalsDebug`：`true` 时打印 `[ClientError]` / `[Web Vitals]` 及「上报已启用」日志
- `environment` / `release`：写入上报 JSON 中的 `mode` / `appVersion`
- `beforeErrorReport` / `beforeWebVitalReport`：返回 `null` 则丢弃该条
- `integrations`：`{ webVitals?: boolean; clientErrors?: boolean }` 可关闭子能力

底层仍会调用 `collectWebVitals` 与 `setupClientErrorReporting`（仅首次挂载监听器；重复 `init` 会刷新运行时配置）。

## Web Vitals（应用层环境变量 → `main.ts` 装配）

| 环境变量                     | 说明                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_WEB_VITALS_REPORT_URL` | 非空时一般由 `webMonitorEnvFromVite()` 传给 `WebMonitor.init`，向该 URL **POST** `application/json` 上报每条指标。             |
| `VITE_WEB_VITALS_DEBUG`      | `true`：每条指标 `console.info`；`false`：即使在 DEV 也不打；**未配置**时：DEV 下默认打印便于联调（规则见 `main.ts` 内函数）。 |

上报通道：优先 `navigator.sendBeacon`，否则 `fetch` + `keepalive: true`（与前端错误上报一致）。可在 URL 上挂 `?token=` 等与采集服务约定鉴权（见 `.env.example` 注释）。

## 前端错误（自研采集）

| 环境变量                  | 说明                                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_ERROR_REPORT_URL`   | 非空时由 `webMonitorEnvFromVite()` 传入 `init`，向该 URL **POST** JSON；为空则 SDK 侧不上报 HTTP（仍可 `debug` / 附加 listener）。       |
| `VITE_ERROR_REPORT_DEBUG` | `true`：每条错误 `console.error('[ClientError]', payload)`；`false`：即使在 DEV 也不打；**未配置**时：DEV 默认打印（规则见 `main.ts`）。 |
| `VITE_APP_VERSION`        | 可选，作为 `release` 传入，写入载荷 `appVersion`（与 Web Vitals 共用）。                                                                 |

### 自动采集范围

- **Vue**：`app.config.errorHandler`，`kind: 'vue'`，带 `vueInfo`（Vue 传入的 info 字符串）。
- **JS 运行时**：`window` 的 `error`（捕获阶段），`kind: 'js'`，含 `source` / `line` / `col` / `stack`（若可得）。
- **资源加载失败**：`IMG`、`SCRIPT`、`LINK`、`VIDEO`、`AUDIO`、`SOURCE`、`TRACK`、`OBJECT`、`EMBED`、`IFRAME` 等标签加载失败，`kind: 'resource'`，`source` 为资源 URL，`tagName` 为元素标签名。
- **未处理 Promise 拒绝**：`unhandledrejection`，`kind: 'unhandledrejection'`。

### 载荷字段（`ClientErrorPayload`）

| 字段           | 说明                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| `kind`         | `vue` \| `js` \| `unhandledrejection` \| `resource`                          |
| `message`      | 错误信息或资源失败描述                                                       |
| `stack`        | 可选，过长会截断（约 16KB 上限）                                             |
| `source`       | 脚本 URL 或资源 URL（资源类用）                                              |
| `line` / `col` | 脚本错误行列（若有）                                                         |
| `tagName`      | 资源失败时的元素标签                                                         |
| `vueInfo`      | Vue errorHandler 的 info                                                     |
| `page`         | `pathname + search`                                                          |
| `ts`           | 客户端毫秒时间戳                                                             |
| `appVersion`   | 来自 `WebMonitor.init` 的 `release`（模板中多为 `VITE_APP_VERSION`）         |
| `mode`         | 来自 `WebMonitor.init` 的 `environment`（模板中多为 `import.meta.env.MODE`） |

手动上报可调用 `reportClientError()` 或 `WebMonitor.reportError()`（从 `@vue3-monorepo/shared/web-monitor` 导入）。共享包另导出 `setAdditionalClientErrorListener`，用于与 HTTP 上报并行的附加消费。

开发环境若已配置 `clientErrorDebug` 且存在上报地址，控制台会有一条提示：`上报已启用 → <url>`。

## 联调页面

`/dev/error-collect`（`src/views/dev/error-collect-test.vue`）可触发示例错误并验证控制台与上报行为。
