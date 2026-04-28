# 新人上手指南

面向**第一次接触本仓库**的同学：从 0 到能**安全改一行业务代码**的最短路径。更细的命令与原理见 [环境与命令速查](./getting-started.md)、[Monorepo 工作流](./monorepo-workflow.md)。

## 1. 开始前你需要知道什么

| 已有基础                                     | 说明                                                            |
| -------------------------------------------- | --------------------------------------------------------------- |
| 会 **Git** 基本操作（clone、branch、commit） | 本仓库有 Husky + commitlint，见根 `README` 与 `CONTRIBUTING.md` |
| 会 **Node.js** 与包管理                      | **只用 pnpm**，勿用 npm/yarn 装依赖                             |
| 会一点 **Vue 3**（`<script setup>`）         | PC 为 Element Plus，H5 为 Vant 4                                |
| 可选                                         | TypeScript、pnpm workspace 概念                                 |

若完全不懂 monorepo：先只记住——**一个仓库里装了好几个前端项目，共享代码在 `packages/shared`**。

## 2. 环境一条线装齐

1. 安装 **Node.js**，版本需满足根 `package.json` 的 `engines.node`（与根 README [环境要求](https://github.com/YanivWang/vue3-monorepo#环境要求) 一致）。
2. 安装 **pnpm**，版本需满足 `engines.pnpm`；推荐启用 Corepack 对齐 `packageManager` 字段中的版本（排障见 [排障与 FAQ](./troubleshooting.md)）。
3. 克隆仓库，在**仓库根目录**执行一次：

```bash
pnpm install
```

成功标志：无报错；根目录与部分子包下出现 `node_modules`；Husky 若已配置，`.husky` 可执行。

## 3. 第一天建议做的事（带顺序）

### 步骤 1：确认能启动「管理端（PC）」

```bash
pnpm run admin:dev
```

- 终端里看到 Vite 本地地址，一般为 **`http://127.0.0.1:5173`**（以终端输出为准）。
- 浏览器能打开页面；默认 Mock 下通常**无需真实后端**即可看界面（见 [环境变量说明](./environment-variables.md) 中 `VITE_USE_MOCK`）。进入登录页后可用页面提示的演示账号（当前模板为 **admin / 123456**）；顶栏与登录页右上均可切换 **品牌色** 与 **浅色 / 深色 / 跟随系统**（见 [主题、暗黑与品牌色](./theme.md)）。

**若起不来**：见 [排障与 FAQ](./troubleshooting.md) 或根 README [常见问题](https://github.com/YanivWang/vue3-monorepo#常见问题摘录)（端口、Node 版本、仅允许 pnpm）。

### 步骤 2：再启动 H5

另开一个终端，在**同一仓库根**执行：

```bash
pnpm run h5:dev
```

- 默认 **`http://127.0.0.1:5174`** 左右（以终端为准）。

### 步骤 3：打开文档站（推荐）

```bash
pnpm run docs:dev
```

- 默认 **`http://127.0.0.1:5175`** 左右。
- 在侧栏里继续读 [文档体系总览](./doc-system.md) 和 [架构说明](./architecture.md)。

> **说明**：`pnpm run dev`（根脚本）等价于 `pnpm -r --parallel run --if-present dev`，会对**所有**在 `package.json` 里定义了 `dev` 的 workspace 包执行（默认至少为 `@vue3-monorepo/admin`、`@vue3-monorepo/h5`、`@vue3-monorepo/docs`；`@vue3-monorepo/shared` **无** `dev`）。若通过 `create-app` 增加了更多 app，根 `dev` 会**再多并行**若干进程与端口。多路并行较吃资源，新人可只开**单端**（如上三条之一或某个 `前缀:dev`）。

## 4. 三个应用默认端口速查

| 应用      | 包名                   | 根脚本               | 常见本地地址（以终端为准） |
| --------- | ---------------------- | -------------------- | -------------------------- |
| PC 管理端 | `@vue3-monorepo/admin` | `pnpm run admin:dev` | `http://127.0.0.1:5173`    |
| H5        | `@vue3-monorepo/h5`    | `pnpm run h5:dev`    | `http://127.0.0.1:5174`    |
| 文档站    | `@vue3-monorepo/docs`  | `pnpm run docs:dev`  | `http://127.0.0.1:5175`    |

## 5. 改哪里：一张表避免放错地方

| 需求                                          | 放哪里（不要混）                                                                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 只给 **PC 后台** 用                           | `apps/pc/<你的业务应用>/`（须 `pnpm run create-app` 生成）；**勿**在 `pc-admin-template` 写业务。目录表见 [项目与目录约定](./project-conventions.md)                           |
| 只给 **H5** 用                                | `apps/h5/<你的业务应用>/`（须 `create-app` 生成）；**勿**在 `h5-template` 写业务。同上                                                                                         |
| **两端都要** 用的类型、工具、无业务耦合的封装 | `packages/shared/`，子路径**必须**与 `@vue3-monorepo/shared` 的 [package.json#exports](https://github.com/YanivWang/vue3-monorepo/blob/main/packages/shared/package.json) 一致 |

更系统的决策见 [Monorepo 工作流](./monorepo-workflow.md)。

## 6. 提交前最低检查（在参与 PR 前养成习惯）

在仓库根**依次**执行（与团队 CI 对齐时可再收紧）：

```bash
pnpm run typecheck
pnpm run lint
pnpm run test:run
```

发版/合并前整体验证见 [质量门禁与脚本](./quality-gates.md) 中的 `verify:full` 说明。

## 7. 接下来读什么

| 顺序 | 文档                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | [文档体系总览](./doc-system.md)（全局地图）                                                                                                                                    |
| 2    | [环境与命令速查](./getting-started.md)（命令与易错点）                                                                                                                         |
| 3    | [Monorepo 工作流](./monorepo-workflow.md)（filter、加依赖、加代码）                                                                                                            |
| 4    | [架构说明](./architecture.md)（路由、权限、启动流程）                                                                                                                          |
| 5    | H5 与原生联调时：[bridge-protocol.md 源码路径](https://github.com/YanivWang/vue3-monorepo/blob/main/apps/h5/h5-template/docs/bridge-protocol.md)（在应用目录内，非 VitePress） |

## 8. 常见误区（小白向）

1. **在子包目录里用 npm install** — 必须在**仓库根**用 `pnpm install`，否则破坏 workspace 与 lockfile。
2. **从 H5 里 import Admin 的 store/页面** — 禁止；两应用不共享业务状态与页面。
3. **在 `shared` 里引 Element Plus 或 Vant 做默认 UI** — 会破坏「共享层无强 UI 依赖」的边界；请求层用 `request-core` + 各端 `request-pc` / `request-h5` 注入反馈，见 [HTTP 与 Mock](./http-and-mock.md) 与 [架构说明](./architecture.md)。
4. **在 `pc-admin-template` / `h5-template` 里写业务** — 两目录仅为模板源；应 `pnpm run create-app` 生成应用后在产物目录开发，见 [新增 H5 / Admin 应用](./adding-a-new-app.md)。
5. **随便改 `pnpm-lock.yaml`** — 除非你在做依赖升级且清楚影响；否则只通过正常 `pnpm add` / `pnpm update` 流程变更。

有不确定时：先问「这段代码是只给哪一端用的？」再决定放 `apps/...` 还是 `packages/shared`。
