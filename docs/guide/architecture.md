# 架构说明

## 技术栈

| 分类     | 技术                        | 版本  |
| -------- | --------------------------- | ----- |
| 框架     | Vue 3 (Composition API)     | ^3.4  |
| 构建     | Vite                        | ^5.3  |
| 语言     | TypeScript                  | ^5.5  |
| UI       | Element Plus                | ^2.7  |
| 状态管理 | Pinia                       | ^2.1  |
| 路由     | Vue Router                  | ^4.3  |
| HTTP     | Axios                       | ^1.7  |
| 国际化   | Vue I18n                    | ^9.14 |
| 工具函数 | VueUse / Lodash-ES / Day.js | —     |

## 启动流程

```
main.ts bootstrap()
  ├─ setupStore(app)          # 1. 注册 Pinia
  ├─ registerDirectives(app)  # 2. 注册全局指令（v-permission / v-role）
  ├─ setupPlugins(app)        # 3. 注册插件
  │   ├─ setupErrorHandler    #    全局异常处理
  │   ├─ setupElementPlus     #    Element Plus 图标
  │   └─ setupI18n            #    vue-i18n
  ├─ app.use(router)          # 4. 注册路由
  ├─ router.isReady()         # 5. 等待路由守卫执行完成
  ├─ app.mount('#app')        # 6. 挂载
  └─ initWebVitals()          # 7. 启动 Web Vitals 监控
```

## 路由体系

### 静态路由（`router/index.ts`）

- 登录、注册、忘记密码、403、404
- Layout + `/home`

### 动态路由（`stores/modules/permission.ts`）

- 登录后调用 `GET /menu/routes` 获取后端菜单
- `menuToRoutes()` 将菜单转为 Vue Router 路由对象
- `addRoute('Layout', route)` 挂载到 Layout 子路由下
- 路由组件通过 `import.meta.glob('../../views/**/*.vue')` 懒加载

### 路由守卫（`router/guards.ts`）

```
beforeEach:
  未登录 → /login（白名单直接放行）
  已登录未加载路由 → fetchUserInfo + generateRoutes → addRoute
  已登录 → 检查 meta.permissions / meta.roles
afterEach:
  设置 document.title
  tabsStore.addTab(to)
```

## 状态管理

| Store        | 职责                          |
| ------------ | ----------------------------- |
| `app`        | 主题/语言/侧边栏/页面加载状态 |
| `user`       | 登录/用户信息/token/权限/角色 |
| `permission` | 菜单/动态路由/路由加载状态    |
| `tabs`       | 标签页列表/当前 Tab 操作      |

## HTTP 层（`utils/http/`）

```
HttpRequest 类
  ├─ pendingRequests: Map<key, AbortController>   # 请求取消池
  ├─ 请求拦截
  │   ├─ cancelDuplicate → 取消旧请求，注册新 AbortController
  │   ├─ showLoading → 全局 Loading
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

## 权限体系

```
后端菜单 → 动态路由（页面级）
用户 permissions[] → v-permission 指令 / hasPermission()（按钮级）
用户 roles[]       → v-role 指令 / hasRole()（角色级）
```

## 主题体系

- CSS 自定义属性（`:root` / `html.dark`）驱动
- `app.setTheme('dark'|'light'|'system')` 切换
- Element Plus 暗黑 CSS 变量集成
- SCSS 变量作为 fallback（编译时静态值）

## 异常处理

| 层级                     | 处理方式                                        |
| ------------------------ | ----------------------------------------------- |
| HTTP 错误                | Axios 响应拦截 + ElMessage                      |
| Vue 组件错误（可降级）   | ErrorBoundary 组件                              |
| Vue 组件错误（全局兜底） | `app.config.errorHandler`                       |
| 全局 JS 错误             | `window.onerror`                                |
| 未捕获 Promise           | `window.addEventListener('unhandledrejection')` |

## 性能监控

`utils/performance.ts` 收集 Core Web Vitals：

- **LCP**（最大内容绘制）目标 < 2.5s
- **INP**（输入延迟）目标 < 200ms
- **CLS**（累计布局偏移）目标 < 0.1
- **FCP**（首次内容绘制）目标 < 1.8s
- **TTFB**（首字节时间）目标 < 800ms

## 构建优化

- **分包**：element-plus / vue-vendor / vue-i18n / utils 独立 chunk
- **压缩**：Gzip + Brotli 双格式（nginx 预读压缩文件）
- **懒加载**：所有页面路由组件均为动态导入
- **按需加载**：Element Plus + 图标通过 unplugin-vue-components 自动按需
