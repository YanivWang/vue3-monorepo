# @vue3-mono/request-pc

PC 端 HTTP 预设：在 `@vue3-mono/request` 之上绑定 Element Plus 的默认 UI 反馈（ElMessage / ElMessageBox / ElLoading），并集成基于 Cookie 的 Token 存储。

## 使用

```ts
import { createPcHttp } from '@vue3-mono/request-pc'

const http = createPcHttp({
  baseURL: import.meta.env.VITE_API_PREFIX,
  timeout: 10000,
  successCode: 200,
  refreshPath: '/auth/refresh',
  loginPath: '/login',
  tokenKey: import.meta.env.VITE_TOKEN_KEY,
  refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY,
  onLogout: async () => {
    const userStore = useUserStore()
    await userStore.reset()
  }
})

// 正常发起请求
const user = await http.get<UserInfo>('/user/info')
```

## 特性

- 默认错误 / 业务错误 → `ElMessage.error`
- 401 自动走刷新流程（`@vue3-mono/request` 核心单例 Promise）
- 刷新失败 → `ElMessageBox.confirm` 提示并跳转登录
- 加载中 → `ElLoading.service` 全局计数器
- 完全基于 `@vue3-mono/request` 依赖注入：可传 `hooks` 覆盖默认行为

## 暴露

- `createPcHttp(options)`：工厂函数，返回 `HttpRequest`
- `createPcHooks(tokenProvider, options)`：获取默认 hooks
- `createElLoadingHandler(options)`：获取 Loading 处理器
- Types 透传：`RequestConfig`、`TokenProvider`、`RequestHooks` 等
