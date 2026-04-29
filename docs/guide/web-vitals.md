# 全局性能监控

本页说明 **Web Vitals**（尤其 **Core Web Vitals**）的含义，以及 H5 模板中如何通过环境变量与插件采集、上报。构建分包与首屏优化见 [Vite 构建优化](./performance.md)；错误与可观测整体见 [全局错误监控](./errors-and-observability.md)。

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

## 本仓库中的实现（H5 模板）

H5 在 `main.ts` 启动 early 调用 `collectWebVitals()`（不依赖 Vue 实例），与前端错误上报插件分工并行。实现代码：`apps/h5/h5-template/src/plugins/webVitalsReport.ts`（依赖 [`web-vitals`](https://github.com/GoogleChrome/web-vitals)）。

当前注册采集：**FCP、LCP、CLS、TTFB、INP**。每条指标经 `reportWebVital` 序列化后，在配置了上报地址时 **POST** JSON 到采集端；调试模式下可输出到控制台。

更细的插件顺序、与 `VITE_APP_VERSION` 共用、错误侧字段等，见应用内说明 `apps/h5/h5-template/docs/observability.md`。

## 环境变量

| 变量                         | 说明                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `VITE_WEB_VITALS_REPORT_URL` | 非空时向该 URL **POST** `application/json` 上报每条指标                                                    |
| `VITE_WEB_VITALS_DEBUG`      | `true`：每条指标 `console.info`；`false`：开发环境也不打日志（仍会上报）；未配置时开发环境默认打印便于联调 |
| `VITE_APP_VERSION`           | 可选，写入载荷 `appVersion`（与 [全局错误监控](./errors-and-observability.md) 一致，便于关联版本）         |

上报通道：优先 `navigator.sendBeacon`，否则 `fetch` + `keepalive: true`，与错误上报策略一致，利于页面卸载时送达。

## 上报载荷（扁平 JSON）

单条指标会包含 `name`、`value`、`rating`、`delta`、`id`、`navigationType`、`page`（pathname + search）、`ts`、`appVersion`、`mode` 等字段，便于接入自建观测或日志管道。字段定义以 `webVitalsReport.ts` 中 `WebVitalPayload` 为准。

## 延伸阅读

- [web.dev：Web Vitals](https://web.dev/articles/vitals)
- [Vite 构建优化](./performance.md)（分包、分析与首屏）
- [全局错误监控](./errors-and-observability.md)（错误分层与 H5 插件）
