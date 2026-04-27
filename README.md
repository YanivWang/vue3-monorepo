# vue3-monorepo-template

企业级 Vue3 monorepo 模板：pnpm workspace、PC 管理端（Element Plus）、移动端 H5（Vant 4 + Bridge）、VitePress 文档站与共享包 `@vue3-mono/shared`。依赖版本以根目录 `package.json` 与 `pnpm-lock.yaml`（及 `pnpm-workspace.yaml` 中的 `catalog`）为准。

**完整文档（新人/小白优先）**：本仓库的**文档体系**（多页指南 + 组件说明）写在 VitePress 包中，与根 README 分工为「README 精简要、文档站可展开」。

| 你打算…… | 优先阅读（Markdown 源文件路径，在 Git 中也可直接打开） |
| --- | --- |
| 第一次 clone，不知道从哪条命令开始 | [docs/guide/onboarding.md](docs/guide/onboarding.md) |
| 理解文档分几层、和 README 谁写什么 | [docs/guide/doc-system.md](docs/guide/doc-system.md) |
| 查 `pnpm`、filter、新代码/依赖放哪 | [docs/guide/monorepo-workflow.md](docs/guide/monorepo-workflow.md) |
| 查 `verify:full`、lint、test 何时跑 | [docs/guide/quality-gates.md](docs/guide/quality-gates.md) |
| 与根表一致的命令/端口速查 | [docs/guide/getting-started.md](docs/guide/getting-started.md) |

在本地起文档站（默认端口与根「脚本速查」一致，常见为 **5175**）：

```bash
pnpm run docs:dev
```

更多指南与组件说明见文档站侧栏；协作规范见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 目录

- [环境要求](#环境要求)
- [技术栈](#技术栈)
- [仓库结构](#仓库结构)
- [快速开始](#快速开始)
- [故障参考](#故障参考)
- [根目录脚本速查](#根目录脚本速查)
- [Git 与提交规范](#git-与提交规范)
- [架构要点](#架构要点)
- [Docker 与本地镜像](#docker-与本地镜像)
- [环境变量](#环境变量)
- [新功能与目录约定](#新功能与目录约定)
- [许可证](#许可证)

> 文首**完整文档**表中的 Markdown 在仓库中始终可读；不启动 `docs:dev` 也可在 IDE 里直接打开。细节以文档站页面为准，根 README 作速查与索引。

## 环境要求

| 项 | 要求 |
| --- | --- |
| Node.js | `>=20.19.5`（见根 `package.json` 的 `engines`） |
| 包管理器 | **pnpm** `>=10.17.0`（与 `packageManager` 字段一致；仓库已配置 `preinstall` 仅允许 pnpm，请勿与 npm/yarn 混用） |

## 技术栈

| 分类 | 技术 | 说明 |
| --- | --- | --- |
| 核心 | Vue 3、Vite、TypeScript | 具体版本以 lock / catalog 为准 |
| 路由与状态 | Vue Router、Pinia | 各 app 内自建，不跨 app 共享 store |
| UI | Element Plus（PC）/ Vant 4（H5） | 组件按需 `import` |
| 请求 | Axios | 封装见 `@vue3-mono/shared/request-*` |
| 其他常用 | @VueUse、dayjs、lodash-es、js-cookie、Sass 等 | — |

## 仓库结构

```
vue3-monorepo-template/
├── apps/
│   ├── pc/pc-admin-template/     # PC 管理端，dev 默认端口 5173
│   └── h5/h5-template/         # H5，dev 默认端口 5174
├── docs/                        # VitePress，dev 默认端口 5175
├── packages/shared/            # 单包 @vue3-mono/shared，子路径与 package.json#exports 一致
├── scripts/
│   ├── check-refs.js           # workspace 与 tsconfig paths 一致
│   ├── check-request-core.js   # request-core 不依赖 UI
│   └── docker.sh               # 调度 docker compose
├── docker/
│   ├── docker-compose.yaml     # admin-web / h5-web / docs-web
│   ├── images/                 # 各端 Dockerfile
│   └── nginx/                  # 静态与 /api 反代
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── vitest.workspace.ts
└── package.json
```

业务与页面在 **`apps/*`**；可复用逻辑在 **`packages/shared`**，经 `@vue3-mono/shared/...` 引用。

## 快速开始

```bash
pnpm install
pnpm run admin:dev    # 或 pnpm run h5:dev / pnpm run docs:dev
```

推送或发版前，可在本地执行 `pnpm run verify:full`（见下表）做一次全量校验；并与团队策略对齐 `pnpm audit --audit-level=high` 等。

## 故障参考

| 现象 / 提示 | 可尝试处理 |
| --- | --- |
| `The engine "node" is incompatible` 或运行期与 Vite/TS 行为异常 | 使用 **Node `>=20.19.5`**（见[环境要求](#环境要求)）。可用 [nvm](https://github.com/nvm-sh/nvm)、[fnm](https://github.com/Schniz/fnm) 等切换版本后重新 `pnpm install`。 |
| 执行 `npm install` / `yarn` 时提示 **only-allow pnpm** | 本仓**仅支持 pnpm**，请在仓库根目录执行 `pnpm install`，勿混用其他包管理器。 |
| `pnpm: command not found` 或 pnpm 版本低于 `engines` | 安装/升级 pnpm 至 `>=10.17.0`；若已装 Node 16.13+，可执行 `corepack enable` 后按根目录 `packageManager` 字段对齐版本。 |
| 开发服启动报 **端口已被占用**（如 `EADDRINUSE`，默认 **5173** / **5174** / **5175**） | 结束占用端口的进程，或调整对应应用下 Vite 的 `server.port` / `--port`；并行 `pnpm run dev` 时避免多实例抢同一端口。 |
| 依赖解析异常、安装后仍报错、怀疑本地装坏 | 在仓库根执行 `pnpm run clean:install`（会删**根目录与各 workspace 包**下的 `node_modules` 后重装；加 `--` 传参：`pnpm run clean:install -- -y` 跳过确认）。亦可手动删各层 `node_modules` 再 `pnpm install`；**勿随意删改 `pnpm-lock.yaml`** 除非与团队流程一致。 |
| `git commit` 不跑 lint / commitlint，或刚 clone 后无 `.husky` | 在根目录执行一次 `pnpm install` 以触发 `prepare` 安装 Husky；仍异常可检查 `core.hooksPath` 是否被全局 Git 配置覆盖。 |
| **Docker** 相关容器起不来、页面空白、接口不通 | 见[Docker 与本地镜像](#docker-与本地镜像)中的端口、compose 与 `docker:*` 脚本；用 `pnpm run docker:logs` 或 `docker compose ... logs` 看服务日志。 |

## 根目录脚本速查

| 用途 | 命令 |
| --- | --- |
| 清依赖并重装（排障） | `pnpm run clean:install`（无确认：`pnpm run clean:install -- -y`） |
| 并行启动所有带 `dev` 的包 | `pnpm run dev` |
| 开发 | `pnpm run admin:dev` / `pnpm run h5:dev` / `pnpm run docs:dev` |
| 单端类型检查 | `pnpm run admin:typecheck` / `pnpm run h5:typecheck` |
| 全 workspace 类型检查 | `pnpm run typecheck`（别名 `type-check`） |
| 仅 packages 类型检查 | `pnpm run typecheck:packages` |
| 单端单元测试 | `pnpm run admin:test` / `pnpm run h5:test` |
| 全仓测试（Vitest） | `pnpm run test`（别名 `test:run`） |
| 测试 watch / 覆盖率 | `pnpm run test:watch` / `pnpm run test:coverage` |
| ESLint / Stylelint | `pnpm run lint` / `pnpm run lint:style`（`:fix` 变体见 package.json） |
| Prettier 全仓写入 | `pnpm run format` |
| 引用与 request-core 检查 | `pnpm run check:refs` / `pnpm run check:request-core` |
| 全量校验 | `pnpm run verify:full` → `check:refs` + `check:request-core` + `typecheck` + `lint` + `lint:style` + `prettier --check` + `test` + `build` |
| 构建（admin → h5 → docs） | `pnpm run build`；单端：`pnpm run admin:build` / `pnpm run h5:build` / `pnpm run docs:build` |
| 文档预览（构建后） | `pnpm run docs:preview` |
| 应用内预览 | `pnpm --filter @vue3-mono/admin preview` / `pnpm --filter @vue3-mono/h5 preview` |

## Git 与提交规范

克隆后若已执行 `pnpm install`，`prepare` 会安装 Husky：

| Hook | 时机 | 作用 |
| --- | --- | --- |
| `pre-commit` | `git commit` 前 | `lint-staged`：对暂存文件跑 ESLint、Stylelint、Prettier |
| `commit-msg` | 提交信息写入后 | `commitlint`，约定 Conventional Commits |

`HUSKY=0 git commit` 可临时跳过 Hook（不建议长期使用）。

**格式**：`<type>(<scope>): <subject>`

示例：

```
feat(auth): 新增 OAuth2 登录方式
fix(http): 修复并发 401 时 refresh 队列问题
chore: 升级 vite
```

| type | 含义 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `perf` | 性能 |
| `refactor` | 重构（非新功能/非修复） |
| `style` | 格式（不影响逻辑） |
| `test` | 测试 |
| `docs` | 文档 |
| `build` | 构建或依赖 |
| `ci` | CI/CD |
| `chore` | 其他杂项 |
| `revert` | 回滚 |
| `wip` | 临时工作提交 |

## 架构要点

### 请求层（`@vue3-mono/shared`）

- **`request-core`**：Axios 核心，不依赖任何 UI；通过 `onError` / `onUnauthorized` / `TokenProvider` 等注入。
- **`request-pc`**：`createPcHttp`，默认 Element Plus 反馈；**admin** 使用。
- **`request-h5`**：`createH5Http`，默认 Vant 反馈；H5 在 `src/plugins/http.ts` 等装配。

### PC 管理端（`apps/pc/pc-admin-template`）

Element Plus、动态路由与权限、Mock 位于 `mock/`。HTTP、布局、页面在 `src/*`。

### H5（`apps/h5/h5-template`）

Vant 4、多宿主 **Bridge**（`@vue3-mono/shared/bridge`）、栈式 `keep-alive`、`postcss-mobile-forever` 等。协议说明见 `apps/h5/h5-template/docs/bridge-protocol.md`；Mock 在 `mock/`。

### 共享与约束

- **Pinia store、路由、按业务划分的 API 模块不跨 app**；可共享类型、枚举、工具、`request-*`、hooks、端专用组件/指令等。
- **权限指令**：PC 为 `directives-pc`；H5 为 `directives-h5`（工厂注入 `hasPermission` / `hasRole`）。

`exports` 的完整列表与路径约定见 [packages/shared/package.json](packages/shared/package.json)。

## Docker 与本地镜像

[docker/docker-compose.yaml](docker/docker-compose.yaml) 提供三个服务，用于**生产风格镜像的本地验证**（构建上下文为仓库根）：

| 服务 | 默认宿主机端口 | 说明 |
| --- | --- | --- |
| `admin-web` | `8080`（`ADMIN_PORT`） | 见 `docker/images/admin/Dockerfile`、`docker/nginx/admin.conf` |
| `h5-web` | `8081`（`H5_PORT`） | 见 `docker/images/h5/Dockerfile`、`docker/nginx/h5.conf` |
| `docs-web` | `8082`（`DOCS_PORT`） | 见 `docker/images/docs/Dockerfile` |

Admin / H5 默认按 **docker** 模式构建（同源 `/api` + nginx 反代至宿主机，默认 `host.docker.internal:3000`）。需要生产环境变量打镜像时可设置 `ADMIN_BUILD_MODE=production` 或 `H5_BUILD_MODE=production`（详见 compose 头注释与 nginx 配置）。

**常用命令**（封装自 [scripts/docker.sh](scripts/docker.sh)）：

- 一键起全套：`pnpm run docker:up`
- 仅某一服务：`pnpm run docker:admin:up` / `pnpm run docker:h5:up` / `pnpm run docker:docs:up`
- 停止 / 日志：`pnpm run docker:down` + `docker:logs`；单服务有 `docker:*:down`、`docker:*:logs`

也可在仓库根执行：`docker compose -p vue3-mono -f docker/docker-compose.yaml up --build -d`。

## 环境变量

**通用**（Vite 前缀 `VITE_`；具体以各应用构建为准）：

| 变量 | 说明 | 常见默认 |
| --- | --- | --- |
| `VITE_APP_TITLE` | 应用标题 | 见各 `.env` |
| `VITE_API_BASE_URL` | 接口基地址 | 如 `http://localhost:3000` |
| `VITE_API_PREFIX` | 请求前缀 / 代理 | 如 `/api` |
| `VITE_TOKEN_KEY` / `VITE_REFRESH_TOKEN_KEY` | Cookie 中 token 键名 | 见示例 |
| `VITE_API_SUCCESS_CODE` | 与后端约定成功业务码 | 如 `200` 或 `0` |
| `VITE_USE_MOCK` | `true` 时走内建 mock | 生产宜 `false` |

各端完整变量与说明请以示例文件为准并自行复制为 `.env.*`（勿提交敏感信息）：

- [apps/pc/pc-admin-template/.env.example](apps/pc/pc-admin-template/.env.example)
- [apps/h5/h5-template/.env.example](apps/h5/h5-template/.env.example)

## 新功能与目录约定

**这一节是干什么的？** 说明在仓库里**加新功能、新页面、新接口**时，文件习惯放在哪；**不是**在介绍两个产品的业务含义（那是你们团队的产品文档范畴）。

仓库里对应 **两个独立的前端应用**（各装各的依赖、各跑各的 dev，代码默认不混写）：

| 应用 | 在仓库里的位置 | 典型场景 |
| --- | --- | --- |
| PC 管理端 | [apps/pc/pc-admin-template](apps/pc/pc-admin-template) | 后台表格、权限菜单、Element Plus |
| 移动端 H5 | [apps/h5/h5-template](apps/h5/h5-template) | 手机站、Vant、与宿主 App 的 Bridge |

下面路径中，未写全的均以各应用下的 `src/` 为根（如 `src/views` 指 `pc-admin-template/src/views`）。

**先想一步：新代码要放哪？**

| 你的需求 | 放哪里 |
| --- | --- |
| 只给 **PC 后台** 用 | 全部写在 `apps/pc/pc-admin-template` 下面对应目录 |
| 只给 **H5** 用 | 全部写在 `apps/h5/h5-template` 下面对应目录 |
| **PC 和 H5 都要**用（类型、纯函数、请求封装、无业务耦合的 hook 等） | [packages/shared/src](packages/shared/src)，用 `@vue3-mono/shared/…` 按子路径引用（与 [package.json#exports](packages/shared/package.json) 一致） |

**Admin（PC）新功能——常见三类文件**

| 做什么 | 路径 |
| --- | --- |
| 新接口 / API 模块 | `apps/pc/pc-admin-template/src/api/modules/` |
| 新页面、布局相关 | `src/views/`；路由与菜单配置在 `src/router/` |
| 新全局/模块状态（Pinia） | `src/stores/modules/` |
| 注意 | **不要**在 Admin 里 `import` H5 应用里的 store 或业务页面。 |

**H5 新功能——常见三类文件**

| 做什么 | 路径 |
| --- | --- |
| 新接口 / API | `apps/h5/h5-template/src/api/` |
| 新页面 | `src/views/`；**路由表**在 `src/router/routes.ts`（与 Admin 的 router 组织方式可能不同，以本应用为准） |
| 新状态（Pinia） | `src/stores/modules/` |
| 注意 | 同样**不要**在 H5 里 `import` Admin 的 store 或业务页面。 |

**跨端复用放 shared 时，怎么引用？**

- 源文件在 `packages/shared/src/` 下按域划分；对外名字由 [packages/shared/package.json](packages/shared/package.json) 的 `exports` 决定。
- 在业务代码里用包名子路径，例如：`@vue3-mono/shared/types`、`…/utils`、`…/request-core`（无 UI）、`…/request-pc` 或 `…/request-h5`（带各端提示）、`…/bridge`（H5 与宿主通信）、`…/hooks-core` / `…/hooks-pc` / `…/hooks-h5`、`…/components-pc` / `…/components-h5`、`…/directives-pc` / `…/directives-h5`、`…/styles/tokens` 等；**有疑惑时以 `exports` 为准**。

## 许可证

[MIT](LICENSE)
