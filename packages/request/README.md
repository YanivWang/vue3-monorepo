# @vue3-mono/request

UI 无关的 HTTP 核心。基于 axios 二次封装，提供：

- 请求/响应拦截器
- Token 自动注入（通过 `TokenProvider` 依赖注入）
- 401 自动刷新 Token（单例 Promise，并发 401 共享同一次刷新）
- 5xx 指数退避重试
- 请求去重（`cancelDuplicate`）
- 统一错误归一化（`NormalizedError`）
- 依赖注入式钩子：`onError` / `onUnauthorized` / `onRefreshToken` / `onBusinessError`

## 设计原则

- **UI 无关**：不直接依赖任何 UI 框架（Element Plus / Vant / ...）
- **可组合**：所有副作用（Toast、跳登录、Loading）都通过钩子/依赖注入交给 UI 绑定层
- **跨端通用**：PC（`@vue3-mono/request-pc`）、H5（`@vue3-mono/request-h5`）均基于本包扩展

## 快速使用

```ts
import { createHttp } from '@vue3-mono/request'

const http = createHttp({
  baseURL: '/api',
  timeout: 10000,
  successCode: 200,
  refreshPath: '/auth/refresh',
  tokenProvider: {
    getToken: () => localStorage.getItem('token') ?? undefined,
    setToken: t => localStorage.setItem('token', t),
    removeToken: () => localStorage.removeItem('token'),
    getRefreshToken: () => localStorage.getItem('refresh') ?? undefined,
    setRefreshToken: t => localStorage.setItem('refresh', t),
    removeRefreshToken: () => localStorage.removeItem('refresh')
  },
  hooks: {
    onError: ({ error }) => {
      console.warn('[HTTP]', error.message)
    },
    onUnauthorized: () => {
      location.href = '/login'
    }
  }
})

await http.get<UserInfo>('/user/info')
```

## 目录

```
src/
  index.ts        # 统一导出
  core.ts         # HttpRequest class + createHttp factory
  types.ts        # RequestConfig / ResponseData / NormalizedError / 钩子类型
  utils.ts        # 工具：请求 key、指数退避、错误归一化
```

## 构建

- `pnpm build`：unbuild 产出 ESM + CJS + d.ts
- `pnpm stub`：开发态 stub，直接指向 src

## 与 UI 绑定层的关系

| 场景        | 绑定层                                       |
| ----------- | -------------------------------------------- |
| PC 后台管理 | `@vue3-mono/request-pc`（Element Plus 预设） |
| H5 移动端   | `@vue3-mono/request-h5`（Vant 预设）         |

绑定层在本包基础上：预设 `onError` → `ElMessage.error / showToast`；`onUnauthorized` → 跳登录；并挂接 Loading 等。
