# @vue3-mono/utils

与 UI 无关的两端通用工具集，构建输出 esm + cjs。

## 内容

| 模块             | 说明                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| `common.ts`      | 日期（dayjs）/ URL / 字符串 / 数组 / 文件大小 / 剪贴板 / debounce 等 |
| `storage.ts`     | Cookie / localStorage（可选 TTL）/ sessionStorage / Token 存取工厂   |
| `echarts.ts`     | ECharts 按需注册（BarChart/LineChart/PieChart 等）                   |
| `performance.ts` | Web Vitals 收集 + 评级 + 可配置上报                                  |
| `validate.ts`    | 常用校验（邮箱 / 手机 / 身份证 / URL）                               |
| `mask.ts`        | 敏感数据脱敏（手机 / 邮箱 / 身份证 / 通用）                          |
| `host.ts`        | H5 宿主检测（浏览器 / 微信 / 支付宝 / APP WebView）                  |

## 设计要点

- **无 UI 框架依赖**：不引 Element Plus、Vant；若需提示反馈，请在上层 `hooks-pc` / `hooks-h5` 中处理。
- **无 i18n 依赖**：本地化数字/日期格式化放在 `@vue3-mono/locale`。
- **SSR 友好**：涉及 `window` / `document` 的 API 均做运行时判空。
- **依赖注入**：`createTokenStorage({ tokenKey, refreshTokenKey })` 返回独立 Token 存取器，供 `@vue3-mono/request` 按应用注入。

## 使用

```ts
import { formatDate, debounce, lsSet, lsGet, createTokenStorage } from '@vue3-mono/utils'
import { detectHost, isInWebview } from '@vue3-mono/utils'
import { initWebVitals } from '@vue3-mono/utils'
import { echarts, type EChartsOption } from '@vue3-mono/utils'
```

## 构建

```bash
pnpm --filter @vue3-mono/utils build   # 生成 dist/{esm,cjs,types}
pnpm --filter @vue3-mono/utils stub    # 开发期 stub（零成本热更）
```
