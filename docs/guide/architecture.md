# 架构说明

**仓库骨架**以 **pnpm workspace（Monorepo）** 为核心：`packages/shared`、**`request-core` / `js-bridge` / `web-monitor`** 与各应用同仓，**PC 管理端与 H5 模板地位对等**——应用侧共同依赖 **`shared`** 与 **`@vue3-monorepo/web-monitor`**；H5 另可直接依赖 **`@vue3-monorepo/js-bridge`**，无主从之分。

本文**正文**以 **PC 管理端模板**（`apps/pc/pc-admin-template`）为主描述启动、路由、HTTP 等实现，便于对照（后台能力文档化较深）；若你的工程由 `pnpm run create-app` 生成，**结构相同**，请将路径替换为实际应用目录。**H5** 在 [项目与目录约定](./project-conventions.md) 中有对称路径说明，本文在结构类似处会注明差异。更上层的**仓库与包边界**见下节。

## Monorepo 仓库级视图

```mermaid
flowchart TB
  subgraph apps [apps 默认模板包]
    admin[pc-admin-template]
    h5[h5-template]
  end
  subgraph packages [packages]
    shared["@vue3-monorepo/shared"]
    rc["@vue3-monorepo/request-core"]
    bridge["@vue3-monorepo/js-bridge"]
    monitor["@vue3-monorepo/web-monitor"]
  end
  subgraph tooling [工程与文档]
    docsPkg[docs VitePress]
  end
  admin --> shared
  admin --> monitor
  h5 --> shared
  h5 --> monitor
  h5 --> bridge
  shared --> rc
  shared --> bridge
```

> 图中为**开箱默认**的两条模板包；**业务开发**请在 `create-app` 生成的应用目录中进行（见 [项目与目录约定](./project-conventions.md)）。还可在 `apps/pc/*`、`apps/h5/*` 下通过 `pnpm run create-app` 增加更多独立工程，通常依赖 **`shared`** 与 **`@vue3-monorepo/web-monitor`**（H5 另可直接依赖 **`js-bridge`**），并各自占用独立 dev 端口（见 [脚手架一键新增业务应用](./adding-a-new-app.md)）。

| 单元                        | 职责                                                                                                                                                                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/pc/pc-admin-template` | PC **模板**（`create-app` 蓝本）：Element Plus、动态路由与权限、Mock；业务代码写在生成目录中                                                                                                                                                        |
| `apps/h5/h5-template`       | H5 **模板**（`create-app` 蓝本）：Vant、Bridge、移动端适配；业务代码写在生成目录中                                                                                                                                                                  |
| `packages/shared`           | 跨端复用：类型、工具、`@vue3-monorepo/request-core` 的 PC/H5 封装（**`@vue3-monorepo/shared/request-pc`** / **`@vue3-monorepo/shared/request-h5`**）、hooks、分端组件与指令等；依赖 **`request-core`**、**`js-bridge`**；**不**承载业务强耦合 store |
| `packages/request-core`     | **`@vue3-monorepo/request-core`**：无 UI 的 Axios 客户端内核（注入式 hooks）；由 `shared` 的 `request-*` 装配，门禁见 `check:request-core`                                                                                                          |
| `packages/js-bridge`        | **`@vue3-monorepo/js-bridge`**：多宿主 Bridge（浏览器 / 小程序 / App WebView）；H5 应用可直接依赖，`shared`（如枚举 `H5Host`）再导出便于统一口径                                                                                                    |
| `packages/web-monitor`      | **`@vue3-monorepo/web-monitor`**：Web Vitals 与客户端错误上报；**由各应用 `main.ts` 直连**，不经过 `shared`                                                                                                                                         |
| `docs`                      | 本文档站 `pnpm run docs:dev` / `docs:build`                                                                                                                                                                                                         |
| 根 `package.json` 脚本      | 聚合 `typecheck` / `lint` / `test` / `build` / `verify:full` 等                                                                                                                                                                                     |

**构建顺序**（根 `pnpm run build`）：默认 `admin:build` → `h5:build` → `docs:build`。若在 `create-app` 时勾选将新应用写入根 `build` 链，或手工改过根 `package.json` 的 `build` 字段，**以当前仓库内脚本为准**。新代码与目录放哪见 [项目与目录约定](./project-conventions.md)。

## 技术栈

版本以仓库根目录 `package.json` 为准，以下为当前主要依赖（节选）：

| 分类     | 技术                                                                                                                                                                                                                          | 版本                                                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 框架     | Vue 3 (Composition API)                                                                                                                                                                                                       | ^3.4.31                                                                                                                        |
| 构建     | Vite                                                                                                                                                                                                                          | ^5.3.3                                                                                                                         |
| 语言     | TypeScript（`tsconfig` 中 `strict: true`）                                                                                                                                                                                    | ^5.5.3                                                                                                                         |
| UI（PC） | Element Plus                                                                                                                                                                                                                  | ^2.7.6                                                                                                                         |
| UI（H5） | Vant 4                                                                                                                                                                                                                        | 见 `pnpm-workspace.yaml` catalog（`h5-template` 等为 `catalog:`）                                                              |
| 状态管理 | Pinia + pinia-plugin-persistedstate                                                                                                                                                                                           | ^2.1.7 / ^3.2.3（见 `pnpm-workspace.yaml` catalog）                                                                            |
| 路由     | Vue Router                                                                                                                                                                                                                    | ^4.3.3                                                                                                                         |
| HTTP     | Axios：**`@vue3-monorepo/request-core`** + **`@vue3-monorepo/shared/request-pc`** / **`request-h5`**，应用内 `src/utils/http` 等装配                                                                                          | ^1.7.2                                                                                                                         |
| 国际化   | Vue I18n（`src/locales`）                                                                                                                                                                                                     | ^9.14.4                                                                                                                        |
| 监控     | PC / H5 共用：`WebMonitor.init`（`web-vitals` + `setupClientErrorReporting` 内核，**`@vue3-monorepo/web-monitor`**，源码 `packages/web-monitor/src`）；附加上报使用 `setAdditionalClientErrorListener` + `ClientErrorPayload` | 见 [全局性能监控](./web-vitals.md)、[全局错误监控](./errors-and-observability.md)、`apps/h5/h5-template/docs/observability.md` |
| 工具     | VueUse、Lodash-ES、Day.js 等                                                                                                                                                                                                  | 见 `dependencies`                                                                                                              |

## 启动流程

与 `apps/pc/pc-admin-template/src/main.ts` 中 `bootstrap()` 一致（Element Plus 的 CSS 与全局样式在 `bootstrap` 之前通过顶层 `import` 注入）：

```
bootstrap()
  0. createApp(App) → WebMonitor.init(buildWebMonitorInit(app, …))  # 尽早接管错误/性能采集
  1. setupStore(app)              # Pinia + persistedstate 插件（须最先，其它模块依赖它）
  2. await loadInitialAdminI18n() # 懒加载当前语言 + fallback 的 shared 词条
  3. registerDirectives(app)      # v-permission / v-role / v-copy（依赖 Pinia）
  4. installComponents(app)       # @vue3-monorepo/shared/components-pc 全局组件
  5. app.use(router)              # 先注册路由（须在 setupPlugins 前）
  6. setupPlugins(app)            # 顺序：Element Plus 图标 → vue-i18n
  7. await router.isReady()
  8. app.mount('#app')
```

H5（`apps/h5/h5-template/src/main.ts`）顺序略有差异：`startMock()` → `useBridge()` → `loadInitialH5I18n()` → `createApp` + `WebMonitor.init` → Pinia → router → i18n → `useAppStore().init()` → 组件与指令 → `router.isReady()` → `bootstrapUserInfo()` → `mount`。两端均在 `createApp` 之后调用 `WebMonitor.init`，参数由各自的 `webMonitorEnvFromVite()` 从 Vite 环境装配。

## 路由体系

### 静态路由（`router/index.ts`）

- 登录、注册、忘记密码、403、Layout（含子路由 `home`、嵌套 `examples`：crud / form / upload / charts 等）、404 兜底
- 需登录的页面也可配置 `meta.permissions`（如首页 `dashboard:view`）

### 动态路由（`stores/modules/permission.ts`）

- 登录后调用 `GET /menu/routes` 获取后端菜单
- `menuToRoutes()` 将菜单转为 Vue Router 路由对象
- `addRoute('Layout', route)` 挂载到 Layout 子路由下
- 路由组件通过 `import.meta.glob('../../views/**/*.vue')` 懒加载

### 路由守卫（`router/guards.ts`）

```
beforeEach（含 NProgress）:
  无 token：白名单 /login、/register、/forgot-password 或 requiresAuth === false 放行，否则去登录
  有 token 访问 /login：重定向 /
  有 token 但无 userInfo：fetchUserInfo，失败则登出
  动态路由未加载：generateRoutes 后对每段 router.addRoute('Layout', route)，并 replace 重匹配
  已加载：合并 to.matched 上的 meta.permissions，非空时须命中其一（some + hasPermission），否则 → /403
  （RouteMeta.roles 已声明，当前守卫不校验；角色请用 v-role / usePermission().hasRole()）
afterEach: document.title、tabsStore.addTab、NProgress.done
```

## 状态管理 {#state-management}

| Store        | 职责                          |
| ------------ | ----------------------------- |
| `app`        | 主题/语言/侧边栏/页面加载状态 |
| `user`       | 登录/用户信息/token/权限/角色 |
| `permission` | 菜单/动态路由/路由加载状态    |
| `tabs`       | 标签页列表/当前 Tab 操作      |

## HTTP 层（`request-core` + 应用内装配） {#http-layer}

PC 模板在 `src/utils/http`（或插件）基于 **`@vue3-monorepo/shared/request-pc`** → 内部使用 **`@vue3-monorepo/request-core`** 构建实例；H5 同理走 **`@vue3-monorepo/shared/request-h5`**。行为上与下列抽象一致（取消池、拦截器链以当前模板代码为准）：

```
HTTP 实例（createPcHttp / createH5Http → request-core 的 HttpRequest）
  ├─ pendingRequests: Map<key, AbortController>   # key 默认 `${METHOD}:${url}`，可用 requestKey 覆盖
  ├─ 请求拦截
  │   ├─ cancelDuplicate → abort 同 key 旧请求，注册新 AbortController
  │   ├─ showLoading → loading.onStart()（PC=ElLoading，H5=Vant Toast，均带计数器）
  │   ├─ withToken !== false → 注入 Authorization: Bearer <token>
  │   └─ GET → 追加 `_t=Date.now()` 破缓存（同名 params 会覆盖它）
  └─ 响应拦截
      ├─ 成功 → 移出池 / onEnd()，校验 code === successCode，否则抛 type:'business'
      └─ 失败 → 移出池 / onEnd()
          ├─ canceled       → type:'canceled'，静默（不触发 onError）
          ├─ ECONNABORTED   → type:'timeout'
          ├─ 无 response    → type:'network'
          ├─ 401            → skipAuthRefresh 或无 refreshToken 时直接 onUnauthorized；
          │                   否则走单例 refreshToken() 后带新 token 重放；刷新失败则清 token + onUnauthorized
          ├─ status >= 500  → 按 retryCount / retryDelay 指数退避重试（仅 5xx）
          └─ 其余           → type:'http'，403/404/500 有内置文案
```

`showError !== false` 时上述错误会回调 `hooks.onError`（PC=`ElMessage.error`，H5=`showFailToast`）；`canceled` 恒不提示。可用配置项见 `packages/request-core/src/types.ts` 的 `RequestConfig`。

**请求取消用法**（`cancelRequest` / `cancelAllRequests` 是 `HttpRequest` 实例方法，应用侧从自己的 http 单例上调用）：

```ts
import http from '@/utils/http' // H5 为 `import { http } from '@/plugins/http'`

// 防重复请求：同 key 的旧请求会被 abort
http.get('/search', { keyword }, { cancelDuplicate: true })

// 自定义 key
http.get('/search', { keyword }, { cancelDuplicate: true, requestKey: 'search' })
http.cancelRequest('search')

// 页面离开 / 退出登录时取消全部
onUnmounted(() => http.cancelAllRequests())
```

## 权限体系 {#permission-arch}

```
后端菜单 → 动态路由（页面级）
用户 permissions[] → v-permission 指令 / hasPermission()（按钮级）
用户 roles[]       → v-role 指令 / hasRole()（角色级）
```

## 主题体系

- **CSS 变量**：共享包 `tokens/index.scss`（`_root` + `_brands` + `_dark` + `_dark-element`）；**H5** 经 `styles/index.scss` 引入共享 tokens + Vant 映射。
- **深浅模式**：`useAppStore().setTheme('light' | 'dark' | 'system')`；内部 `applyThemeMode`；`system` 跟随 `prefers-color-scheme`，store 内 `themeTick` 用于 Vue 侧响应式刷新；枚举见 `@vue3-monorepo/shared/enums` 的 `ThemeMode`。
- **品牌色**：`useAppStore().setBrand(BrandId)`；内部 `applyBrand`；`getAppliedBrand` / `getAppliedThemeMode` 等见 `@vue3-monorepo/shared/styles/tokens`。
- **无 Pinia 场景**：`createUseTheme`（`@vue3-monorepo/shared/hooks-core`）、`createUseThemeH5`（`@vue3-monorepo/shared/hooks-h5`），详见 [主题与品牌切换](./theme.md)。
- **PC 模板交互**：顶栏 `LayoutHeader` 与登录页均提供 **品牌色 + 主题模式** 下拉，未登录也可切换以便预览。
- **Element Plus**：`theme-chalk/dark/css-vars.css` 在 `main.ts` 中紧跟官方 `dist/index.css` 之后、应用全局 `index.scss` 之前引入。
- **构建注入**：`@use "@vue3-monorepo/shared/styles/tokens/variables" as *;` 经 Vite `additionalData` 注入各 SFC 的 SCSS（详见 [Design Token](./design-tokens.md)）。

## 异常处理 {#error-handling}

> 全局 JS / Promise / 资源错误与 `app.config.errorHandler` 均由 `@vue3-monorepo/web-monitor` 的 `WebMonitor.init` 统一注册（见 `packages/web-monitor/src/clientErrorMonitoring.ts`）。

| 层级                     | 处理方式                                                                      |
| ------------------------ | ----------------------------------------------------------------------------- |
| HTTP 错误                | Axios 响应拦截 + `shared/request-pc` 预设的 ElMessage / ElMessageBox          |
| Vue 组件错误（可降级）   | ErrorBoundary 组件                                                            |
| Vue 组件错误（全局兜底） | `app.config.errorHandler`（链式保留已有 handler）                             |
| 全局 JS 错误             | `window.addEventListener('error', …, true)`（捕获阶段，同时识别资源加载失败） |
| 未捕获 Promise           | `window.addEventListener('unhandledrejection')`                               |

## 构建优化 {#build-optimization}

- **分包**：见各应用 `vite.config.ts` 的 `manualChunks`。PC 产出 `element-plus` / `vue-i18n` / `vue-vendor` / `utils`，H5 产出 `vant` / `vconsole` / `vue-i18n` / `vue-vendor` / `utils`。匹配只作用于「最后一个 `node_modules/` 之后」的包路径（仓库目录名含 `vue`，直接匹配绝对路径会把所有依赖吸进 `vue-vendor`），且更具体的判断排在 `vue` 之前。未列出的三方库（如 `echarts`）交给 Rollup 自动归入按需加载的路由 chunk
- **压缩**：Gzip + Brotli 双格式（nginx 预读压缩文件）
- **懒加载**：所有页面路由组件均为动态导入
- **按需加载**：在页面/组件内显式 `import` Element Plus 与 `@element-plus/icons-vue`；Vite `manualChunks` 将 `element-plus` 等打入独立 chunk
