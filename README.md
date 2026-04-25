# vue3-monorepo-template

企业级开箱即用 Vue3 + Vite + TypeScript 脚手架，零配置、零报错、一键启动。

## 技术栈

| 分类         | 技术                             | 版本        |
| ------------ | -------------------------------- | ----------- |
| 核心框架     | Vue 3                            | ^3.4        |
| 构建工具     | Vite                             | ^5.3        |
| 类型系统     | TypeScript                       | ^5.5        |
| 路由         | Vue Router                       | ^4.3        |
| 状态管理     | Pinia                            | ^2.1        |
| UI 组件库    | Element Plus（PC）/ Vant 4（H5） | ^2.7 / ^4.9 |
| HTTP 请求    | Axios                            | ^1.7        |
| 组合式工具   | @VueUse                          | ^10.11      |
| 日期处理     | dayjs                            | ^1.11       |
| 工具函数     | lodash-es                        | ^4.17       |
| Cookie       | js-cookie                        | ^3.0        |
| CSS 预处理   | Sass                             | ^1.77       |
| 进度条       | nprogress                        | ^0.2        |
| UI 组件引用   | 源码中显式 `import`（Element Plus / Vant） | —           |

## 目录结构（pnpm workspace）

```
vue3-monorepo-template/
├── apps/
│   ├── admin/                   # PC 管理端（Element Plus），端口默认 5173
│   ├── h5/                      # 移动端 H5（Vant 4 + 多宿主 Bridge），端口 5174
│   └── docs/                    # VitePress 文档站
├── packages/
│   ├── shared/                  # 类型、枚举、常量、设计 tokens（SCSS + TS）
│   ├── utils/                   # 工具函数、宿主检测、Token 存储工厂等
│   ├── bridge/                  # 多宿主 Bridge（browser / wx-mini / ali-mini / native-app）
│   ├── request/                 # Axios 核心（UI 无关 + 依赖注入）
│   ├── locale/                  # vue-i18n 框架层
│   ├── hooks/                   # 与 UI 无关的 composables
│   ├── pc/                      # PC 专用四包：components / hooks / directives / request
│   └── h5/                      # H5 专用四包：components / hooks / directives / request
├── scripts/
│   └── check-refs.js            # 校验 workspace 与 tsconfig paths 一致
├── pnpm-workspace.yaml          # workspace glob + catalog 版本锁
├── tsconfig.base.json           # 根 paths 与编译基线
├── vitest.workspace.ts
├── docker/                      # Docker 编排（参照 deer-flow：compose + nginx + images）
│   ├── docker-compose.yaml    # Admin 本地/默认编排
│   ├── nginx/admin.conf        # PC 静态站 nginx
│   └── images/admin/Dockerfile
├── scripts/docker.sh            # docker compose 快捷命令
└── package.json                 # 根脚本：admin:* / docker:admin:* / verify:p3 …
```

业务代码在 **`apps/*`**；可复用能力在 **`packages/*`**。Pinia Store、路由、API 模块**不跨 app 共享**，仅共享类型与工具包。

## 快速开始

本项目使用 [pnpm](https://pnpm.io/) 与单一份 `pnpm-lock.yaml` 锁定依赖（`catalog:` 统一版本），请勿与 npm/yarn 混用。

```bash
# 1. 安装依赖（`pnpm-workspace` 见根目录，共 17 个包）
pnpm install

# 2. 开发：PC 管理端（默认 5173）
pnpm run admin:dev

# 3. 开发：H5（默认 5174，需 `apps/h5/h5-template/.env.development` 中 VITE_USE_MOCK 等）
pnpm run h5:dev

# 4. 文档站
pnpm run docs:dev

# 5. 类型检查（全 workspace 并行）
pnpm run typecheck
# 与 CI 一致别名
pnpm run type-check

# 6. ESLint / Stylelint
pnpm run lint
pnpm run lint:style

# 7. workspace 与 tsconfig paths 一致性
pnpm run check:refs

# 8. 单元测试（Vitest workspace）
pnpm run test
pnpm run test:run

# 9. 构建：admin + h5 + docs（顺序执行，供 CI / 发布）
pnpm run build

# 10. 单端构建
pnpm run admin:build
pnpm run h5:build
pnpm run docs:build

# 11. 预览（在对应 app 目录下或使用 filter）
pnpm --filter @vue3-mono/admin preview
pnpm --filter @vue3-mono/h5 preview
```

CI（GitHub Actions）会在推送/PR 时执行 `check:refs`、`lint`、`lint:style`、`type-check`、`test:run`、`build`（含 `pnpm audit`）。

首次克隆后已启用 Husky，两个 Hook 自动生效：

| Hook         | 触发时机        | 执行内容                                                      |
| ------------ | --------------- | ------------------------------------------------------------- |
| `pre-commit` | `git commit` 前 | `lint-staged`（ESLint + Stylelint + Prettier 仅处理暂存文件） |
| `commit-msg` | 填写提交信息后  | `commitlint`（校验 Conventional Commits 格式）                |

### 提交信息规范（commitlint）

格式：`<type>(<scope>): <subject>`，例如：

```
feat(auth): 新增 OAuth2 登录方式
fix(http): 修复并发 401 时 refresh 队列未清空的问题
chore: 升级 vite 到 5.4
```

支持的 `type`：

| type       | 含义                        |
| ---------- | --------------------------- |
| `feat`     | 新功能                      |
| `fix`      | Bug 修复                    |
| `perf`     | 性能优化                    |
| `refactor` | 代码重构（非新功能/非修复） |
| `style`    | 代码格式（不影响逻辑）      |
| `test`     | 测试相关                    |
| `docs`     | 文档更新                    |
| `build`    | 构建或依赖变更              |
| `ci`       | CI/CD 配置变更              |
| `chore`    | 其他杂项                    |
| `revert`   | 回滚提交                    |
| `wip`      | 开发中的临时提交            |

若需临时跳过 Hook：`HUSKY=0 git commit ...`（不推荐长期使用）。

## 架构要点

### 请求层（三包）

- **`@vue3-mono/request`**：Axios 核心，禁止直接依赖任何 UI；通过 `onError` / `onUnauthorized` / `TokenProvider` 等注入。
- **`@vue3-mono/request-pc`**：`createPcHttp`，默认 Element Plus 反馈；**admin** 使用。
- **`@vue3-mono/request-h5`**：`createH5Http`，默认 Vant 反馈；**h5** 在 `src/plugins/http.ts` 装配。

### PC 管理端（`apps/pc/pc-admin-template`）

- Element Plus、动态路由/权限、Mock 位于 `apps/pc/pc-admin-template/mock/`。
- HTTP、布局、业务页面路径均为 `apps/pc/pc-admin-template/src/*`（详见该目录）。

### H5（`apps/h5/h5-template`）

- Vant 4、`@vue3-mono/bridge` 多宿主、栈式 `keep-alive`、`postcss-mobile-forever` 视口适配。
- Mock：`apps/h5/h5-template/mock/`；多宿主说明见 `apps/h5/h5-template/docs/bridge-protocol.md`。
- 示例：长列表 + 详情 + 新建/编辑/删除（`apps/h5/h5-template/src/views/list/`），筛选使用包内 `FilterDrawer` 与 `useProListFilters`。

### 共享包与约束

- **Store 不跨 app**：仅共享 `@vue3-mono/shared` 等类型与工具。
- **权限指令**：PC 为 `@vue3-mono/directives-pc`；H5 为 `@vue3-mono/directives-h5`（工厂注入 `hasPermission` / `hasRole`）。

### 容器镜像

- **`docker/images/admin/Dockerfile`**（构建上下文为 **仓库根**）：`pnpm --filter @vue3-mono/admin build`，nginx 配置为 **`docker/nginx/admin.conf`**。本地：`pnpm run docker:admin:up` 或 `docker compose -f docker/docker-compose.yaml up --build`。H5 / 文档需另起镜像或扩展 `docker/`。
- **P3 全量门禁**：根目录执行 `pnpm run verify:p3`（refs、request 无 UI、typecheck、lint、stylelint、prettier --check、test、build）。

## 环境变量

| 变量名                   | 说明                             | 默认值                     |
| ------------------------ | -------------------------------- | -------------------------- |
| `VITE_APP_TITLE`         | 应用标题                         | vue3-monorepo-template     |
| `VITE_API_BASE_URL`      | 后端接口地址                     | http://localhost:3000      |
| `VITE_API_PREFIX`        | 请求前缀（Vite proxy key）       | /api                       |
| `VITE_TOKEN_KEY`         | Access Token 存储 key（Cookie）  | access_token               |
| `VITE_REFRESH_TOKEN_KEY` | Refresh Token 存储 key（Cookie） | refresh_token              |
| `VITE_API_SUCCESS_CODE`  | 与后端约定成功的业务 `code`      | 200（若成功码为 0 则填 0） |
| `VITE_USE_MOCK`          | 为 `true` 时用户 API 走内建 mock | 生产建议 `false`           |

## 新增业务模块指引

**Admin（PC）**

1. 接口：`apps/pc/pc-admin-template/src/api/modules/`
2. 页面与路由：`apps/pc/pc-admin-template/src/views/`、`apps/pc/pc-admin-template/src/router/`
3. Store：`apps/pc/pc-admin-template/src/stores/modules/`（勿引用 H5 应用的 store）

**H5**

1. 接口：`apps/h5/h5-template/src/api/`
2. 页面与路由：`apps/h5/h5-template/src/views/`、`apps/h5/src/router/routes.ts`
3. Store：`apps/h5/h5-template/src/stores/modules/`

**跨端可复用逻辑**

- 纯函数 / 类型：优先放 `@vue3-mono/shared` 或 `@vue3-mono/utils`
- 与 UI 无关的 composable：`@vue3-mono/hooks`
- 端专用 UI：分别放 `packages/{components,directives,hooks,request}/{pc,h5}`；共享 `hooks` / `request` 在子目录 `core`
