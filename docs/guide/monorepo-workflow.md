# Monorepo 工作流

说明本仓库 **pnpm workspace** 的日常用法：如何**只动一个包**、如何**加依赖**、**新代码放哪**、**共享包怎么引用**。与根 `README`「新功能与目录约定」互补，这里偏**操作细节**。

## 1. Workspace 里有哪些包

- **根目录**：`package.json` 放**全仓脚本**与公共开发依赖（ESLint、Vitest 等），不是发布 npm 的包。
- **apps/**：可运行的前端应用，如 `@vue3-monorepo/admin`、`@vue3-monorepo/h5`。
- **packages/**：库代码，如 `@vue3-monorepo/shared`。
- **docs/**：VitePress 包 `@vue3-monorepo/docs`。

工作区根列表见 [`pnpm-workspace.yaml`](https://github.com/your-org/vue3-monorepo/blob/main/pnpm-workspace.yaml)。

## 2. 根脚本 vs 子包脚本

| 方式                                     | 示例                                          | 适用场景                          |
| ---------------------------------------- | --------------------------------------------- | --------------------------------- |
| **根** `package.json#scripts` 封装的简写 | `pnpm run admin:dev`                          | 日常最省事，**不必记 filter**     |
| **pnpm 过滤单包**                        | `pnpm --filter @vue3-monorepo/admin <script>` | 与根脚本等价，CI 里有时直接写这个 |
| **进入子目录再 pnpm**                    | 不推荐在子目录单独 `pnpm install` 作为常态    | 仍应以**根** lockfile 为准        |

`pnpm -r`（recursive）在根里用于**遍历多个包**执行同一脚本（如根 `typecheck`）。

## 3. 给「某一个应用」加依赖

始终在**仓库根**执行，并用 `--filter` 指定工作区包名（见各子包 `name` 字段）：

```bash
# 仅给 PC 管理端加运行时依赖
pnpm add <包名> --filter @vue3-monorepo/admin

# 仅给 H5
pnpm add <包名> --filter @vue3-monorepo/h5

# 给 shared 加（两端都能 workspace 引用）
pnpm add <包名> --filter @vue3-monorepo/shared
```

加**开发依赖**（如仅某 app 的插件）时加 `-D`：

```bash
pnpm add -D <包名> --filter @vue3-monorepo/admin
```

执行后**只会**更新根 `pnpm-lock.yaml` 和对应子包 `package.json`，符合 monorepo 单锁文件惯例。

## 4. 版本与 catalog

根 `pnpm-workspace.yaml` 里可能配置了 **`catalog:`**，子包中依赖可写 `catalog:xxx` 以统一版本。升级依赖时：

- 以团队流程为准，通常改 `pnpm-workspace.yaml` 的 catalog 或子包 `package.json`，再 `pnpm install`。
- **不要**手改 `pnpm-lock.yaml` 的巨型 diff；应用标准 pnpm 命令产生变更。

## 5. 新代码放哪：决策简表

| 问题                                                                                     | 选择                                                                                      |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 只服务 **一个端** 的页面、路由、store、接口封装                                          | 放在**对应** `apps/pc/...` 或 `apps/h5/...` 下，见根 README 表格。                        |
| **PC 和 H5 都要** 用：纯类型、常量、与 UI 无关的工具、`request-core` 扩展、通用 hooks 等 | 放 `packages/shared/src`，经 `@vue3-monorepo/shared/...` 子路径 **export 出去**。         |
| 带 **Element** 的组件                                                                    | 放 shared 的 **components-pc** 域（以 `exports` 为准）或先放 admin 内，视团队复用度而定。 |
| 带 **Vant** 的组件                                                                       | 类似，走 **components-h5** 或 h5 应用内。                                                 |

**强约束**（与根 README 一致）：

- **Pinia、路由、按业务划分的 API 不跨 app**。
- `request-core` **实现**中不得调用 Element / Vant 等 **UI 反馈 API**（仓库有 `check-request-core` 脚本做关键字门禁）；PC/H5 的提示与拦截用 `request-pc` / `request-h5` 在应用里装配。

## 6. 怎么查「能 import 什么」

打开 [`packages/shared/package.json`](https://github.com/your-org/vue3-monorepo/blob/main/packages/shared/package.json) 的 **`exports` 字段**。

示例（含义：业务里写 `@vue3-monorepo/shared/utils` 会解析到 `src/utils/index.ts`）：

```text
@vue3-monorepo/shared/utils
@vue3-monorepo/shared/request-core
@vue3-monorepo/shared/hooks-pc
```

**不要**写未在 `exports` 中声明的深层路径，避免将来目录调整导致静默 breakage。

## 7. 路径别名与 TS

全仓有 `tsconfig.base.json` 等；子应用内可能有各自 `tsconfig` 与 Vite `alias`。出现「能跑不能类型检查」时：

- 先跑 `pnpm run typecheck` 或单端 `pnpm run admin:typecheck` / `pnpm run h5:typecheck`。
- 与 workspace 包名、tsconfig references、`workspace:*` 依赖等相关的问题可再跑 `pnpm run check:refs`（见 `scripts/check-refs.js` 与 [质量门禁与脚本](./quality-gates.md)）。

## 8. 文档与改动的关系

- 动 **对外组件 API** 或 **shared exports**：同步更新 [文档站](../index.md) 中相关页，并遵守 `CONTRIBUTING.md` 的说明。

---

更多故障场景见根 [README 故障参考](https://github.com/your-org/vue3-monorepo#故障参考) 与 [质量门禁与脚本](./quality-gates.md)。
