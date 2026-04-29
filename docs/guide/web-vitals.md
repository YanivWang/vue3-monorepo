# 全局性能监控

本页说明 **Web Vitals**（尤其 **Core Web Vitals**）的含义，以及 **PC 管理端与 H5 模板**如何在 **`src/main.ts`** 装配并调用 `@vue3-monorepo/shared/web-monitor`。构建分包与首屏优化见 [Vite 构建优化](./performance.md)；错误与可观测整体见 [全局错误监控](./errors-and-observability.md)。

## 什么是 Web Vitals

**Web Vitals** 是 Google 提出的一组面向真实用户的体验指标，用于衡量加载性能、交互响应与视觉稳定性。其中对搜索与体验评估最关键的三项合称 **Core Web Vitals**（核心网页指标）；指标集会随规范演进（例如交互维度已由 INP 替代早期的 FID）。

| 指标                                 | 含义（简述）                                             | 优秀经验阈值（常见口径） |
| ------------------------------------ | -------------------------------------------------------- | ------------------------ |
| **LCP**（Largest Contentful Paint）  | 视口内最大内容元素绘制完成时间，反映「主要内容何时可见」 | ≤ 2.5s                   |
| **INP**（Interaction to Next Paint） | 用户交互到下一次 paint 的延迟，反映「操作是否跟手」      | ≤ 200ms（good）          |
| **CLS**（Cumulative Layout Shift）   | 布局偏移累计分数，反映「页面是否抖动」                   | ≤ 0.1                    |
| **FCP**（First Contentful Paint）    | 首次任意内容绘制，辅助看白屏结束                         | 诊断用                   |
| **TTFB**（Time to First Byte）       | 首字节时间，反映网络与服务端响应                         | 诊断用                   |

阈值以官方文档与 `web-vitals` 库的 **rating**（`good` / `needs-improvement` / `poor`）为准；上表便于快速对照。

## 本仓库中的实现（PC Admin 与 H5 共用）

两端均在 **`src/main.ts`**、于 **`createApp` 之后** 调用 `WebMonitor.init({ app, ...webMonitorEnvFromVite() })`（函数名以仓库内实际为准）：内部先挂 Web Vitals，再挂全局错误监听（与单独调用 `collectWebVitals` + `setupClientErrorReporting` 等价，且监听器只挂载一次）。共享包 **`@vue3-monorepo/shared/web-monitor`** 不读取 `VITE_*`，由调用方传入。实现位于：

- [`packages/shared/src/web-monitor/webVitalsMonitoring.ts`](../../packages/shared/src/web-monitor/webVitalsMonitoring.ts)（依赖 [`web-vitals`](https://github.com/GoogleChrome/web-vitals)）；统一入口见同目录 [`webMonitor.ts`](../../packages/shared/src/web-monitor/webMonitor.ts) 的 `WebMonitor.init`。

各应用只从 **`@vue3-monorepo/shared/web-monitor`** 导入，并通过 **`WebMonitor.init` 的 `integrations`**（或应用内 `webMonitorEnvFromVite()` 映射的环境变量）单独关闭错误侧或 Web Vitals，勿使用已移除的子路径包导出。

当前注册采集：**FCP、LCP、CLS、TTFB、INP**。每条指标经 `reportWebVital` 序列化后，在配置了上报地址时 **POST** JSON 到采集端；调试模式下可输出到控制台。

更细的插件顺序、与 `VITE_APP_VERSION` 共用、错误侧字段等，见应用内说明 `apps/h5/h5-template/docs/observability.md`。

## 环境变量

| 变量                             | 说明                                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `VITE_WEB_VITALS_REPORT_URL`     | 一般在各端 `main.ts` 中并入 `WebMonitor.init`，非空时向该 URL **POST** `application/json`                      |
| `VITE_WEB_VITALS_DEBUG`          | 在 `main.ts` 装配为 `webVitalsDebug`：`true` / `false` / 未设时 DEV 默认打印等规则见该文件内实现               |
| `VITE_WEB_MONITOR_WEB_VITALS`    | 为 `false` 时关闭 Web Vitals（`integrations.webVitals`）；未设或其它值：保持开启                               |
| `VITE_WEB_MONITOR_CLIENT_ERRORS` | 为 `false` 时关闭客户端错误监控（`integrations.clientErrors`）；未设或其它值：保持开启                         |
| `VITE_APP_VERSION`               | 可选，经 `release` 传入 `init`，写入载荷 `appVersion`（与 [全局错误监控](./errors-and-observability.md) 一致） |

上报通道：优先 `navigator.sendBeacon`，否则 `fetch` + `keepalive: true`，与错误上报策略一致，利于页面卸载时送达。

## 上报载荷（扁平 JSON）

单条指标会包含 `name`、`value`、`rating`、`delta`、`id`、`navigationType`、`page`（pathname + search）、`ts`、`appVersion`、`mode` 等字段，便于接入自建观测或日志管道。字段定义以 `packages/shared/src/web-monitor/webVitalsMonitoring.ts` 中序列化逻辑为准。

## 延伸阅读

- [web.dev：Web Vitals](https://web.dev/articles/vitals)
- [Vite 构建优化](./performance.md)（分包、分析与首屏）
- [全局错误监控](./errors-and-observability.md)（错误分层与 `WebMonitor.init`）
