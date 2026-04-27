# 质量门禁与脚本

把根 `package.json` 里的**常用脚本**说明白：什么时候跑、失败代表什么、和发版/PR 怎么对齐。根 README 的「根目录脚本速查」是**表格式索引**，本页是**使用说明**。

## 1. 日常开发最常用

| 命令                                                           | 作用                                                                                                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run admin:dev` / `pnpm run h5:dev` / `pnpm run docs:dev` | 单端本地开发，节省资源可只开一个                                                                                                                           |
| `pnpm run typecheck`                                           | **全 workspace** 并行 `typecheck`；改 shared 后必跑，避免只绿一端                                                                                          |
| `pnpm run typecheck:packages`                                  | 根脚本为 `pnpm --filter './packages/**' ... typecheck`：当前仓库仅 `packages/shared` 会命中；**不含** `docs`、`apps`（与根 `typecheck` 全 workspace 不同） |
| `pnpm run lint`                                                | 全仓 ESLint                                                                                                                                                |
| `pnpm run lint:style`                                          | Stylelint，覆盖 scss/vue/css 等                                                                                                                            |
| `pnpm run format`                                              | Prettier 全仓**写入**；提交前可配合用                                                                                                                      |
| `pnpm run test:run`                                            | Vitest 单次跑（与根脚本别名 `test` 一致，见下）                                                                                                            |

> 单应用类型检查（更快定位）：`pnpm run admin:typecheck`、`pnpm run h5:typecheck`。

## 2. 测试

在**仓库根**执行时，Vitest 读取根目录的 **`vitest.workspace.ts`（projects 模式）**，当前包含三个 project：

- `apps/pc/pc-admin-template`
- `apps/h5/h5-template`
- `packages/shared`

**不包含** 文档包 `@vue3-mono/docs`（`docs` 无单元测试进该 workspace 配置）。因此 `pnpm run test:run` 跑的是**上述三处**的测试，而不是「全 monorepo 每个包各跑一遍」。

| 命令                                       | 作用                                                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run test:run` / `pnpm run test`      | 在根执行 Vitest **单次**，使用上述 `vitest.workspace.ts`                                                                                                |
| `pnpm run test:watch`                      | 交互/watch，适合 TDD                                                                                                                                    |
| `pnpm run test:coverage`                   | 覆盖率；对接 CI 时打开阈值策略                                                                                                                          |
| `pnpm run admin:test` / `pnpm run h5:test` | `pnpm --filter` 在**单包目录**内执行各 app 的 `test` 脚本；配置以各应用自己的 `vitest.config.ts` 为准，与根 workspace 的**并集/范围可能不同**（调试用） |

根 `verify:full` 里串联的是**根** `test:run`；若只关心某一 app，可在该 app 下单独跑 `admin:test` / `h5:test`。

## 3. 全量校验 `verify:full`

根 `package.json` 中**一字不差**的链为：

`check:refs` → `check:request-core` → `typecheck` → `lint` → `lint:style` → `prettier --check .` → `test:run` → `build`

其中 `build` 即 `admin:build` → `h5:build` → `docs:build`。

**适合**：合并前、发版前、大改 `shared` 后做一次「接近 CI」的完整体检。

**注意**：`build` 会构建三端，耗时较长；日常只改文档时可用 `pnpm run docs:build` 等分段命令代替，不必每次 `verify:full`。

## 4. 仓库特有两项检查

实现以仓库内脚本为准，摘要如下（详见 `scripts/*.js` 文件头注释）：

| 命令                          | 含义                                                                                                                                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run check:refs`         | `scripts/check-refs.js`：workspace 包数量/命名、`tsconfig.base.json` paths 与 `tsconfig.json` references、各包 `workspace:*` 依赖是否**能在当前 workspace 解析**等（**不是**简单的「import 路径字符串扫描」）                                                    |
| `pnpm run check:request-core` | `scripts/check-request-core.js`：在 `packages/shared/src/request-core` 下扫描 `.ts`，**禁止**出现 Element Plus / Vant 等 **UI 反馈类 API 关键字**（如 `ElMessage`、`showToast` 等），防止请求核心层与弹窗/Toast 耦合；与「npm 依赖树是否含 UI 包」不是同一类检查 |

在改 `packages/shared` 下请求、路径、exports 时，**务必**跑通这两项。

## 5. 构建与预览

| 命令                                        | 作用                                           |
| ------------------------------------------- | ---------------------------------------------- |
| `pnpm run build`                            | 顺序 build admin → h5 → docs                   |
| `pnpm run admin:build` 等                   | 单端 build                                     |
| `pnpm run docs:preview`                     | 文档先 `docs:build` 后本地静态预览             |
| `pnpm --filter @vue3-mono/admin preview` 等 | 各 app 的 `vite preview`（见根 README 脚本表） |

## 6. 依赖重装与排障

| 命令                     | 作用                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `pnpm run clean:install` | 清根与各 workspace 下 `node_modules` 后重装；可加 `--` 传 `-y` 跳过确认，见 `scripts/clean-install.sh` |

**典型场景**：lockfile 大合并冲突后、怀疑本地装坏。仍勿随意**手改** `pnpm-lock.yaml`。

## 7. 与 PR / 贡献指南对齐

`CONTRIBUTING.md` 中的 PR 前检查是**基线**（`lint`、`lint:style`、`type-check`（同 `typecheck`）、`test:run`、`build`）。根 `verify:full` 在**此基础上**还包含 `check:refs`、`check:request-core`、`prettier --check .`（顺序见上一节），更适合作为发版/大改前的「一键」预检；与团队 CI 对齐即可。

## 8. 对照表速记

- **5 分钟本地反馈**：`typecheck` + 正在改的一端 `dev`。
- **提 PR 前**：至少 `typecheck` + `lint` + `test:run`；改 shared 加 `check:refs` + `check:request-core`。
- **发版/大合并**：`verify:full`（或 CI 要等价的流水线）。

更上层的学习路径见 [文档体系总览](./doc-system.md)；新人步骤见 [新人上手指南](./onboarding.md)。
