# 环境与命令速查

本页与**当前仓库根 `package.json` 的脚本**保持一致；与根 `README` 的「环境要求」「快速开始」「根目录脚本（摘录）」**互补**——根 README 偏索引，本页可配合 [新人上手指南](./onboarding.md) 对着敲命令。

> **第一次来**：请先读 [文档体系总览](./doc-system.md) 与 [新人上手指南](./onboarding.md)，再回来看本页当手册。

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

要在 monorepo 里**再增加一个** H5 或 PC Admin 工程（第二个 H5、第二个后台等），推荐在仓库根执行 `pnpm run create-app`（交互式），说明与手工步骤见 [新增 H5 / Admin 应用](./adding-a-new-app.md)。

## 3. 本地开发（三端别搞混端口）

| 要启动的  | 根命令               | 包名                   | 说明                         |
| --------- | -------------------- | ---------------------- | ---------------------------- |
| PC 管理端 | `pnpm run admin:dev` | `@vue3-monorepo/admin` | 常见 `http://127.0.0.1:5173` |
| H5        | `pnpm run h5:dev`    | `@vue3-monorepo/h5`    | 常见 `http://127.0.0.1:5174` |
| 文档站    | `pnpm run docs:dev`  | `@vue3-monorepo/docs`  | 常见 `http://127.0.0.1:5175` |

由 `create-app` 新增的 PC / H5 还会在根 `package.json` 里生成 **`前缀:dev`** 等脚本；**前缀**是你在生成器里填的短名。交互提示里出现的默认目录名等与仓库内是否已有该目录无关，仅为命名示例，可按团队规范改掉。

- **`pnpm run dev`（根）**：`pnpm -r --parallel run --if-present dev`，对**所有**带 `dev` 的 workspace 包并行启动（默认至少为 admin、h5、docs；`shared` 无 `dev`；你每多接一个 app 就会多一路进程与端口）。机器吃紧时建议**不用**根 `dev`，改成上表之一或某个 `前缀:dev`。
- 端口被占用时：见 [排障与 FAQ](./troubleshooting.md)，或改各包 Vite 的 `server.port`。

## 4. 构建

| 作用                              | 命令                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| 全仓顺序构建（admin → h5 → docs） | `pnpm run build`                                                                         |
| 仅 PC                             | `pnpm run admin:build`                                                                   |
| 仅 H5                             | `pnpm run h5:build`                                                                      |
| 仅文档                            | `pnpm run docs:build`                                                                    |
| 文档构建后静态预览                | `pnpm run docs:preview`                                                                  |
| 各 app 的 Vite 预览               | `pnpm --filter @vue3-monorepo/admin preview` / `pnpm --filter @vue3-monorepo/h5 preview` |

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

`verify:full` 用的是根 `test:run`；检查项、与 `check:refs` 等差异见 [质量门禁与脚本](./quality-gates.md)。

## 8. 全量与专项校验

| 作用                                     | 命令                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| monorepo 元数据与 tsconfig 一致性等      | `pnpm run check:refs`（见 `scripts/check-refs.js` 头注释）                  |
| request-core 内禁止 UI 反馈 API 关键字等 | `pnpm run check:request-core`（见 `scripts/check-request-core.js`）         |
| 大合并/发版前总检                        | `pnpm run verify:full`（**含** `prettier --check .`；链式至 `build`；较慢） |
| 清 `node_modules` 重装                   | `pnpm run clean:install`（可加 `--` 传 `-y` 跳过确认）                      |

## 9. Docker（可选）

与 [部署说明](./deploy.md) 及根 README 中 Docker/compose 速查一致，常用（封装自 `scripts/docker.sh`）：

- `pnpm run docker:up` / `pnpm run docker:down` / `pnpm run docker:logs`
- 单服务：`pnpm run docker:admin:up` 等

详见 [部署说明](./deploy.md)，端口以 `docker-compose` 与 `.env` 为准。

## 10. 仓库目录（和「单项目模板」不同）

本 **monorepo** 的顶层结构（不是某一 app 下的 `src/`）：

```
/
├── apps/pc/pc-admin-template/   # @vue3-monorepo/admin（默认 PC 模板）
├── apps/pc/<其他>/              # 可选：create-app 生成的更多 PC 应用
├── apps/h5/h5-template/         # @vue3-monorepo/h5（默认 H5 模板）
├── apps/h5/<其他>/              # 可选：create-app 生成的更多 H5 应用
├── docs/                        # @vue3-monorepo/docs
├── packages/shared/             # @vue3-monorepo/shared
├── docker/
├── scripts/
├── pnpm-workspace.yaml
└── package.json
```

在 **默认 PC 模板**里加业务页面、API 等，路径以 `apps/pc/pc-admin-template/src/` 为根；在 **默认 H5 模板**以 `apps/h5/h5-template/src/` 为根；若使用 `create-app` 新开的应用，则以**该目录**下 `src/` 为根。完整约定见 [Monorepo 工作流](./monorepo-workflow.md) 与 [项目与目录约定](./project-conventions.md)。

## 11. 下一步

- [架构说明](./architecture.md) — 应用启动、路由、权限
- [Monorepo 工作流](./monorepo-workflow.md) — `pnpm` `filter`、加依赖
- [质量门禁与脚本](./quality-gates.md) — 深度解释 `verify:full` 与 CI 友好习惯
