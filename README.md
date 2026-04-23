# Vue3 Enterprise Template

企业级开箱即用 Vue3 + Vite + TypeScript 脚手架，零配置、零报错、一键启动。

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 核心框架 | Vue 3 | ^3.4 |
| 构建工具 | Vite | ^5.3 |
| 类型系统 | TypeScript | ^5.5 |
| 路由 | Vue Router | ^4.3 |
| 状态管理 | Pinia | ^2.1 |
| UI 组件库 | Element Plus | ^2.7 |
| HTTP 请求 | Axios | ^1.7 |
| 组合式工具 | @VueUse | ^10.11 |
| 日期处理 | dayjs | ^1.11 |
| 工具函数 | lodash-es | ^4.17 |
| Cookie | js-cookie | ^3.0 |
| CSS 预处理 | Sass | ^1.77 |
| 进度条 | nprogress | ^0.2 |
| 自动导入 | unplugin-auto-import | ^0.18 |
| 组件自动导入 | unplugin-vue-components | ^0.27 |

## 目录结构

```
vue3-vite-template/
├── public/                      # 静态资源（不经过 Vite 处理）
│   └── favicon.svg
├── src/
│   ├── api/                     # 接口层
│   │   ├── index.ts             # 统一导出
│   │   └── modules/
│   │       └── user.ts          # 用户相关接口
│   ├── assets/
│   │   └── styles/              # 全局样式
│   │       ├── index.scss       # 样式入口
│   │       ├── variables.scss   # SCSS 变量
│   │       └── reset.scss       # CSS Reset
│   ├── components/              # 全局公共组件
│   ├── router/                  # 路由配置
│   │   ├── index.ts             # 路由实例
│   │   └── guards.ts            # 路由守卫
│   ├── stores/                  # Pinia 状态管理
│   │   ├── index.ts             # 统一注册
│   │   └── modules/
│   │       ├── user.ts          # 用户 Store
│   │       └── app.ts           # 应用全局 Store
│   ├── types/                   # TypeScript 类型声明
│   │   ├── api.d.ts             # API 类型
│   │   ├── env.d.ts             # 环境变量类型
│   │   ├── global.d.ts          # 全局通用类型
│   │   ├── auto-imports.d.ts    # 自动生成（unplugin-auto-import）
│   │   └── components.d.ts      # 自动生成（unplugin-vue-components）
│   ├── utils/                   # 工具函数
│   │   ├── http/                # Axios 封装
│   │   │   ├── index.ts         # 请求实例 & 拦截器
│   │   │   └── types.ts         # 请求相关类型
│   │   ├── storage.ts           # 本地存储封装
│   │   └── common.ts            # 通用工具函数
│   ├── views/                   # 页面组件
│   │   ├── layout/              # 主布局
│   │   │   ├── index.vue
│   │   │   └── components/
│   │   │       ├── LayoutHeader.vue
│   │   │       ├── LayoutSidebar.vue
│   │   │       └── LayoutMain.vue
│   │   ├── home/
│   │   │   └── index.vue        # 首页
│   │   ├── login/
│   │   │   └── index.vue        # 登录页
│   │   └── error/
│   │       └── 404.vue          # 404 页面
│   ├── App.vue                  # 根组件
│   └── main.ts                  # 应用入口
├── .env                         # 公共环境变量
├── .env.development             # 开发环境变量
├── .env.production              # 生产环境变量
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（端口 5173）
npm run dev

# 3. 类型检查
npm run type-check

# 4. 构建生产包
npm run build

# 5. 预览生产包
npm run preview
```

## 核心功能说明

### Axios 封装（`src/utils/http/index.ts`）

- 统一 `BaseURL`，通过环境变量配置
- 请求拦截器：自动携带 `Authorization: Bearer <token>`，GET 请求防缓存
- 响应拦截器：统一处理业务状态码、401 自动弹出重新登录、网络异常提示
- 返回已剥离 `data` 层的数据，调用方直接获取业务数据
- 支持 `withToken: false` 跳过 Token（登录接口）

```ts
// 使用示例
import http from '@/utils/http'
const data = await http.get<UserInfo[]>('/user/list', { page: 1, pageSize: 10 })
```

### Pinia Store（`src/stores/modules/`）

- `useUserStore`：登录/登出/获取用户信息/权限判断
- `useAppStore`：侧边栏折叠、主题切换（light/dark）、语言切换

```ts
// 使用示例（无需手动导入，已配置自动导入）
const userStore = useUserStore()
await userStore.loginAction({ username: 'admin', password: '123456' })
```

### 路由守卫（`src/router/guards.ts`）

- 未登录 → 自动跳转登录页，携带 `redirect` 参数
- 已登录访问登录页 → 跳转首页
- 每次进入时自动获取用户信息（首次）
- 路由切换自动设置页面 `<title>`
- 集成 NProgress 进度条

### 自动导入

通过 `unplugin-auto-import` + `unplugin-vue-components` 配置：

- Vue API（`ref`、`computed`、`watch` 等）无需手动 import
- Vue Router API（`useRouter`、`useRoute`）无需手动 import
- Pinia API（`defineStore`、`storeToRefs`）无需手动 import
- `@VueUse` 全部 composables 无需手动 import
- Element Plus 组件无需手动注册

### 样式系统

- 全局 SCSS 变量通过 `vite.config.ts` 的 `additionalData` 注入，无需 `@import`
- 包含完整的色彩、间距、阴影、动画变量
- 内置路由切换过渡动画、滚动条美化、常用工具类

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | Vue3 Enterprise Template |
| `VITE_API_BASE_URL` | 后端接口地址 | http://localhost:3000 |
| `VITE_API_PREFIX` | 请求前缀（Vite proxy key） | /api |
| `VITE_TOKEN_KEY` | Token 存储 key | access_token |
| `VITE_USE_MOCK` | 是否开启 Mock | false |

## 新增业务模块指引

1. **新增接口**：在 `src/api/modules/` 下创建文件，并在 `src/api/index.ts` 中导出
2. **新增页面**：在 `src/views/` 下创建目录，在 `src/router/index.ts` 的 `constantRoutes` 中添加路由
3. **新增 Store**：在 `src/stores/modules/` 下创建文件，并在 `src/stores/index.ts` 中导出
4. **新增类型**：在 `src/types/api.d.ts` 或 `src/types/global.d.ts` 中扩展
