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

与 `src/main.ts` 中 `bootstrap()` 一致（Element Plus 与全局样式在 `bootstrap` 之前通过 `import` 注入）：

```
bootstrap()
  1. setupStore(app)           # Pinia + persistedstate 插件
  2. registerDirectives(app)   # v-permission / v-role
  3. app.use(router)           # 先注册路由（部分插件或守卫依赖 Router）
  4. setupPlugins(app)         # 顺序：ClientErrorReporting → Element Plus → I18n
  5. await router.isReady()
  6. app.mount('#app')
```

（Admin 与 H5 均在 `createApp` 后于各端 `src/main.ts` 调用 `WebMonitor.init`，并从 Vite 环境装配参数。）

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
  已加载：仅合并 meta.permissions 做 hasPermission 校验，不通过 → /403
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
HTTP 实例（createPcHttp / createH5Http）
  ├─ pendingRequests: Map<key, AbortController>   # 请求取消池（若启用）
  ├─ 请求拦截
  │   ├─ cancelDuplicate → 取消旧请求，注册新 AbortController
  │   ├─ showLoading → 全局 Loading（端侧 UI）
  │   └─ withToken → 注入 Authorization header
  └─ 响应拦截
      ├─ 成功 → 移出请求池，校验业务 code
      └─ 失败 → 移出请求池 / 取消静默 / 401 自动刷新 / 重试
```

**请求取消用法：**

```ts
// 防重复请求
http.get('/search', { keyword }, { cancelDuplicate: true })

// 页面离开时取消所有请求
import { cancelAllRequests } from '@/utils/http'
onUnmounted(cancelAllRequests)
```

## 权限体系 {#permission-arch}

```
后端菜单 → 动态路由（页面级）
用户 permissions[] → v-permission 指令 / hasPermission()（按钮级）
用户 roles[]       → v-role 指令 / hasRole()（角色级）
```

## 主题体系

- **CSS 变量**：共享包 `_root.scss` / `_brands.scss`（`html[data-brand]`）；**H5** 全局入口 `@use` 共享 `tokens/index.scss`（内含共享 `dark.scss`）；**PC** 在 `assets/styles/index.scss` 中 `@use` 共享 `tokens/root`、`tokens/brands` 与**本应用** `dark.scss`（业务 token 与 **Element Plus `--el-*`** 一并覆盖，不经共享 `tokens/index.scss`）。
- **深浅模式**：`useAppStore().setTheme('light' | 'dark' | 'system')`；内部 `applyThemeMode`；`system` 跟随 `prefers-color-scheme`，store 内 `themeTick` 用于 Vue 侧响应式刷新；枚举见 `@vue3-monorepo/shared/enums` 的 `ThemeMode`。
- **品牌色**：`useAppStore().setBrand(BrandId)`；内部 `applyBrand`；`getAppliedBrand` / `getAppliedThemeMode` 等见 `@vue3-monorepo/shared/styles/tokens`。
- **无 Pinia 场景**：`createUseTheme`（`@vue3-monorepo/shared/hooks-core`）、`createUseThemeH5`（`@vue3-monorepo/shared/hooks-h5`），详见 [主题与品牌切换](./theme.md)。
- **PC 模板交互**：顶栏 `LayoutHeader` 与登录页均提供 **品牌色 + 主题模式** 下拉，未登录也可切换以便预览。
- **Element Plus**：`theme-chalk/dark/css-vars.css` 在 `main.ts` 中紧跟官方 `dist/index.css` 之后、应用全局 `index.scss` 之前引入。
- **构建注入**：`@use "@vue3-monorepo/shared/styles/tokens/variables" as *;` 经 Vite `additionalData` 注入各 SFC 的 SCSS（详见 [Design Token](./design-tokens.md)）。

## 异常处理 {#error-handling}

| 层级                     | 处理方式                                        |
| ------------------------ | ----------------------------------------------- |
| HTTP 错误                | Axios 响应拦截 + ElMessage                      |
| Vue 组件错误（可降级）   | ErrorBoundary 组件                              |
| Vue 组件错误（全局兜底） | `app.config.errorHandler`                       |
| 全局 JS 错误             | `window.onerror`                                |
| 未捕获 Promise           | `window.addEventListener('unhandledrejection')` |

## 构建优化 {#build-optimization}

- **分包**：element-plus / vue-vendor / vue-i18n / utils 独立 chunk
- **压缩**：Gzip + Brotli 双格式（nginx 预读压缩文件）
- **懒加载**：所有页面路由组件均为动态导入
- **按需加载**：在页面/组件内显式 `import` Element Plus 与 `@element-plus/icons-vue`；Vite `manualChunks` 将 `element-plus` 等打入独立 chunk
