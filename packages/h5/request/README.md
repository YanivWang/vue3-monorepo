# @vue3-mono/request-h5

H5 端 HTTP 预设：在 `@vue3-mono/request` 之上绑定 Vant 的默认 UI 反馈（`showFailToast` / `showDialog` / `showLoadingToast`），并集成基于 Cookie 的 Token 存储。

## 使用

```ts
import { createH5Http } from '@vue3-mono/request-h5'

const http = createH5Http({
  baseURL: import.meta.env.VITE_API_PREFIX,
  timeout: 10000,
  successCode: 200,
  refreshPath: '/auth/refresh',
  loginPath: '/login',
  tokenKey: import.meta.env.VITE_TOKEN_KEY,
  refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY,
  // 多宿主下，如需桥接小程序/APP 的登录跳转：
  redirectLogin: () => bridge.navigateToLogin(),
  onLogout: async () => {
    const userStore = useUserStore()
    await userStore.reset()
  }
})

await http.get<UserInfo>('/user/info')
```

## 特性

- 默认错误 / 业务错误 → `showFailToast`
- 401 自动走刷新流程（`@vue3-mono/request` 核心单例 Promise）
- 刷新失败 → `showDialog` 提示并跳转登录（可 `redirectLogin` 自定义）
- 加载中 → `showLoadingToast` 全局计数器 + `closeToast`
- 完全基于 `@vue3-mono/request` 依赖注入：可传 `hooks` 覆盖默认行为

## 暴露

- `createH5Http(options)`：工厂函数，返回 `HttpRequest`
- `createH5Hooks(tokenProvider, options)`：获取默认 hooks
- `createVantLoadingHandler(options)`：获取 Vant Loading 处理器
- Types 透传：`RequestConfig`、`TokenProvider`、`RequestHooks` 等
