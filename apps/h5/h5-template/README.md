# @vue3-mono/h5

H5 移动端应用（Vant 4 + 多宿主：浏览器 / 微信小程序 WebView / 支付宝小程序 WebView / 原生 APP WebView）

## 目录概要

```
apps/h5/h5-template/
├── src/                    # 入口、路由、页面、stores、API
├── mock/
├── public/
├── .env / .env.development / .env.production / .env.staging
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

> 生产级 **Docker/nginx** 可参照 **`docker/images/admin/Dockerfile`** 与 **`docker/nginx/`** 另建 H5 镜像（本 app 默认不自带独立 Dockerfile）。

## 路由栈式 keep-alive（手工回归）

自动化单测见 **`packages/shared/src/hooks-h5/useHistoryStackH5.spec.ts`**。发版前建议在浏览器再确认：

1. 登录后 **Home → List → Theme**，使用系统返回或页面返回：**栈顶弹出**，`KeepAlive` 缓存符合预期（中间页是否销毁与业务一致）。
2. 在 **List** 使用 **`router.replace`** 进入同级页：**栈顶替换**，不应多叠一层（与 **`replace` + History `replaceState`** 一致）。
3. **未登录**访问 `requiresAuth` 路由：应先被鉴权守卫重定向 **Login**，确认 **`setupRouterGuards` 中鉴权先于 `useHistoryStackH5.bind`**，错误路径不会入栈。
