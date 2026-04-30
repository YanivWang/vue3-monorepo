# 环境与命令速查

本页与**当前仓库根 `package.json` 的脚本**保持一致；与根 `README` 的「环境要求」「快速开始」「常用命令」**互补**——根 README 偏索引，本页可配合 [新手上路](./onboarding.md) 对着敲命令。**前提**：仓库是 **pnpm Monorepo**；**`admin:dev` 与 `h5:dev`** 对应两条**同等重要**的业务端模板（无主次）。

> **第一次来**：请先读 [文档体系总览](./doc-system.md) 与 [新手上路](./onboarding.md)，再回来看本页当手册。

## 1. 环境要求

| 工具    | 要求                                                        |
| ------- | ----------------------------------------------------------- |
| Node.js | 满足根 `package.json` 的 `engines.node`（与根 README 一致） |
| pnpm    | 满足 `engines.pnpm`；**仅**使用 pnpm 安装依赖               |
| Git     | 建议 2.x+；用于子模块/Husky 等时按团队要求                  |

**禁止**：在子应用目录单独用 `npm install` / `yarn` 装依赖以替代根安装（会触发根 `preinstall` 的 `only-allow pnpm` 或导致依赖不一致）。

## 2. 安装依赖

在**仓库根目录**执行：

```bash
git clone https://github.com/YanivWang/vue3-monorepo.git
cd vue3-monorepo
pnpm install
```

安装完成后，根与子 workspace 的依赖由 **单一** `pnpm-lock.yaml` 管理。

要在 monorepo 里**新增业务应用**（首个或后续的 **PC Admin 与 H5**，顺序不限），须在仓库根执行 `pnpm run create-app`（交互式）；**勿**在 `pc-admin-template` / `h5-template` 内写业务。说明与手工步骤见 [脚手架一键新增业务应用](./adding-a-new-app.md) 与 [项目与目录约定](./project-conventions.md)。

## 3. 本地开发（三端别搞混端口）

| 要启动的  | 根命令               | 包名                   | 说明                                                                                       |
| --------- | -------------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| PC 管理端 | `pnpm run admin:dev` | `@vue3-monorepo/admin` | 模板包演示，常见 `http://127.0.0.1:5173`；业务请用生成应用的 `前缀:dev` 或 `pnpm --filter` |
| H5        | `pnpm run h5:dev`    | `@vue3-monorepo/h5`    | 模板包演示，常见 `http://127.0.0.1:5174`；业务同上                                         |
| 文档站    | `pnpm run docs:dev`  | `@vue3-monorepo/docs`  | 常见 `http://127.0.0.1:5175`                                                               |

由 `create-app` 新增的 PC / H5 还会在根 `package.json` 里生成 **`前缀:dev`** 等脚本；**前缀**是你在生成器里填的短名。交互提示里出现的默认目录名等与仓库内是否已有该目录无关，仅为命名示例，可按团队规范改掉。

- **`pnpm run dev`（根）**：`pnpm -r --parallel run --if-present dev`，对**所有**带 `dev` 的 workspace 包并行启动（默认至少为 admin、h5、docs；`shared` 无 `dev`；你每多接一个 app 就会多一路进程与端口）。机器吃紧时建议**不用**根 `dev`，改成上表之一或某个 `前缀:dev`。
- 端口被占用时：见 [排障与 FAQ](./troubleshooting.md)，或改各包 Vite 的 `server.port`。

## 4. 构建

| 作用                                                          | 命令                                                                                     |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 全仓顺序构建（admin → h5 → docs，**仅脚本串联、无业务主次**） | `pnpm run build`                                                                         |
| 仅 PC                                                         | `pnpm run admin:build`                                                                   |
| 仅 H5                                                         | `pnpm run h5:build`                                                                      |
| 仅文档                                                        | `pnpm run docs:build`                                                                    |
| 文档构建后静态预览                                            | `pnpm run docs:preview`                                                                  |
| 各 app 的 Vite 预览                                           | `pnpm --filter @vue3-monorepo/admin preview` / `pnpm --filter @vue3-monorepo/h5 preview` |

> Admin/H5 子包中另有 `build:dev` 等模式，以各 `apps/.../package.json` 为准，用于**测试/预发**构建，而非「全仓」默认。

## 5. 代码质量

| 作用                  | 命令                                                   |
| --------------------- | ------------------------------------------------------ |
| ESLint                | `pnpm run lint` / `pnpm run lint:fix`                  |
| Stylelint             | `pnpm run lint:style` / `pnpm run lint:style:fix`      |
| Prettier 全仓写入     | `pnpm run format`                                      |
| Prettier 只检查不写入 | `prettier --check .`（在根执行；`verify:full` 会用到） |

## 6. 类型检查

| 作用              | 命令                                    |
| ----------------- | --------------------------------------- |
| 全 workspace 并行 | `pnpm run typecheck`（同 `type-check`） |
| 仅 `packages/*`   | `pnpm run typecheck:packages`           |
| 仅 Admin          | `pnpm run admin:typecheck`              |
| 仅 H5             | `pnpm run h5:typecheck`                 |

## 7. 测试

| 作用                | 命令                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vitest 单次（根）   | `pnpm run test:run` 或 `pnpm run test`；使用根 `vitest.workspace.ts`，默认含 **admin、h5、shared** 三处 project（`pnpm run create-app` 新增的 **H5 或 PC** 目录也会自动追加到该文件），**不含** `docs` 包 |
| Watch               | `pnpm run test:watch`                                                                                                                                                                                     |
| 覆盖率              | `pnpm run test:coverage`                                                                                                                                                                                  |
| 仅 Admin 子包内测试 | `pnpm run admin:test`                                                                                                                                                                                     |
| 仅 H5 子包内测试    | `pnpm run h5:test`（须在 H5 包内存在 `test` 脚本；模板已与 admin 对齐）                                                                                                                                   |

`verify:full` 用的是根 `test:run`；检查项、与 `check:refs` 等差异见 [代码质量与规范约束](./quality-gates.md)。

## 8. 全量与专项校验

| 作用                                                      | 命令                                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| monorepo 元数据与 tsconfig 一致性等                       | `pnpm run check:refs`（见 `scripts/check-refs.js` 头注释）                  |
| `@vue3-monorepo/request-core` 内禁止 UI 反馈 API 关键字等 | `pnpm run check:request-core`（见 `scripts/check-request-core.js`）         |
| 大合并/发版前总检                                         | `pnpm run verify:full`（**含** `prettier --check .`；链式至 `build`；较慢） |
| 清 `node_modules` 重装                                    | `pnpm run clean:install`（可加 `--` 传 `-y` 跳过确认）                      |

## 9. Docker（可选）

与 [部署与 Docker](./deploy.md) 及根 README 中 Docker/compose 速查一致，常用（封装自 `scripts/docker.sh`）：

- `pnpm run docker:up` / `pnpm run docker:down` / `pnpm run docker:logs`
- 单服务：`pnpm run docker:admin:up` 等

详见 [部署与 Docker](./deploy.md)，端口以 `docker-compose` 与 `.env` 为准。

## 10. 仓库目录（和「单项目模板」不同）

本 **monorepo** 的顶层结构（不是某一 app 下的 `src/`）：

```
/
├── apps/pc/pc-admin-template/   # PC 应用模板（create-app 蓝本；勿写业务）
├── apps/pc/<业务应用>/          # PC 业务工程（须 create-app 生成）
├── apps/h5/h5-template/         # H5 应用模板（create-app 蓝本；勿写业务）
├── apps/h5/<业务应用>/          # H5 业务工程（须 create-app 生成）
├── docs/                        # @vue3-monorepo/docs
├── packages/shared/             # @vue3-monorepo/shared
├── docker/
├── scripts/
├── pnpm-workspace.yaml
└── package.json
```

**业务开发**（页面、API、store 等）一律以 **`pnpm run create-app` 生成**的应用目录下 `src/` 为根，**勿**在 `pc-admin-template` / `h5-template` 内编写。上表 `admin:dev` / `h5:dev` 拉起的是模板包，用于演示与门禁。完整约定见 [pnpm workspace 日常操作](./monorepo-workflow.md) 与 [项目与目录约定](./project-conventions.md)。

## 11. 下一步

- [架构说明](./architecture.md) — 应用启动、路由、权限
- [Monorepo 现代化工程管理方案](./monorepo-introduce.md) — 为何采用 Monorepo
- [pnpm workspace 日常操作](./monorepo-workflow.md) — `pnpm` `filter`、加依赖
- [代码质量与规范约束](./quality-gates.md) — 深度解释 `verify:full` 与 CI 友好习惯
