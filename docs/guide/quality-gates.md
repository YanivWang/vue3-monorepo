# 代码质量与规范约束

把根 `package.json` 里的**常用脚本**说明白：什么时候跑、失败代表什么、和发版/PR 怎么对齐。根 `README.md` 的「常用命令」表是**极简索引**，本页是**完整说明**；与 **GitHub Actions** 的对应见 [CI 与自动化](./ci-and-automation.md)。

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

在**仓库根**执行时，Vitest 读取根目录的 **`vitest.workspace.ts`（projects 模式）**。默认至少包含：

- `apps/pc/pc-admin-template`（模板包，与业务应用并列进 workspace）
- `apps/h5/h5-template`（同上）
- `packages/shared`

使用 `pnpm run create-app` 时，脚本会把**新应用目录**追加进该数组（与根 `pnpm test` 一致；新包内测试脚本与用例仍以模板为准）。**不包含** 文档包 `@vue3-monorepo/docs`（文档站不进该 workspace）。因此 `pnpm run test:run` 跑的是 **workspace 文件里列出的 project** 的测试，而不是「全 monorepo 每个包各跑一遍」。

| 命令                                       | 作用                                                                                                                                                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run test:run` / `pnpm run test`      | 在根执行 Vitest **单次**，使用上述 `vitest.workspace.ts`                                                                                                                                                                                      |
| `pnpm run test:watch`                      | 交互/watch，适合 TDD                                                                                                                                                                                                                          |
| `pnpm run test:coverage`                   | 覆盖率；对接 CI 时打开阈值策略                                                                                                                                                                                                                |
| `pnpm run admin:test` / `pnpm run h5:test` | `pnpm --filter` 在**单包目录**内执行各 app 的 `test` 脚本；配置以各应用自己的 `vitest.config.ts` 为准。若某包**未**声明 `test`，pnpm 会提示无脚本且**仍以 0 退出**，容易误以为跑过测试——模板中 admin / h5 已提供 `test`，新增应用请自行对齐。 |

根 `verify:full` 里串联的是**根** `test:run`；若只关心某一 app，可在该 app 下单独跑 `admin:test` / `h5:test`。

## 3. 全量校验 `verify:full`

根 `package.json` 中**一字不差**的链为：

`check:refs` → `check:request-core` → `typecheck` → `lint` → `lint:style` → `prettier --check .` → `test:run` → `build`

其中 `build` 即 `admin:build` → `h5:build` → `docs:build`。

**适合**：合并前、发版前、大改 `shared` 后做一次「接近 CI」的完整体检。

**注意**：`build` 会构建三端，耗时较长；日常只改文档时可用 `pnpm run docs:build` 等分段命令代替，不必每次 `verify:full`。

## 4. 仓库特有两项检查

实现以仓库内脚本为准，摘要如下（详见 `scripts/*.js` 文件头注释）：

| 命令                          | 含义                                                                                                                                                                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run check:refs`         | `scripts/check-refs.js`：workspace 包数量/命名、`tsconfig.base.json` paths 与 `tsconfig.json` references、各包 `workspace:*` 依赖是否**能在当前 workspace 解析**等（**不是**简单的「import 路径字符串扫描」）                                                                                      |
| `pnpm run check:request-core` | `scripts/check-request-core.js`：扫描 **`@vue3-monorepo/request-core`** 源码目录 `packages/request-core/src` 下 `.ts`，**禁止**出现 Element Plus / Vant 等 **UI 反馈类 API 关键字**（如 `ElMessage`、`showToast` 等），防止请求核心层与弹窗/Toast 耦合；与「npm 依赖树是否含 UI 包」不是同一类检查 |

在改 `packages/shared` 下请求、路径、exports 时，**务必**跑通这两项。

## 5. 构建与预览

| 命令                                            | 作用                                               |
| ----------------------------------------------- | -------------------------------------------------- |
| `pnpm run build`                                | 顺序 build admin → h5 → docs                       |
| `pnpm run admin:build` 等                       | 单端 build                                         |
| `pnpm run docs:preview`                         | 文档先 `docs:build` 后本地静态预览                 |
| `pnpm --filter @vue3-monorepo/admin preview` 等 | 各 app 的 `vite preview`；命令清单见上表与本页上文 |

## 6. 依赖重装与排障

| 命令                     | 作用                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `pnpm run clean:install` | 清根与各 workspace 下 `node_modules` 后重装；可加 `--` 传 `-y` 跳过确认，见 `scripts/clean-install.sh` |

**典型场景**：lockfile 大合并冲突后、怀疑本地装坏。仍勿随意**手改** `pnpm-lock.yaml`。

## 7. 与 PR / 贡献指南对齐

`CONTRIBUTING.md` 中的 PR 前检查是**基线**（`lint`、`lint:style`、`type-check`（同 `typecheck`）、`test:run`、`build`）。根 `verify:full` 在**此基础上**还包含 `check:refs`、`check:request-core`、`prettier --check .`（顺序见上一节），更适合作为发版/大改前的「一键」预检；与团队 CI 对齐即可。

## 8. 对照表速记

- **5 分钟本地反馈**：`typecheck` + 正在改的一端 `dev`。
- **提 PR 前**：至少 `typecheck` + `lint` + `test:run`；改 **`@vue3-monorepo/shared`** 或 **`@vue3-monorepo/request-core`** 等 workspace 包时加 `check:refs` + `check:request-core`。
- **发版/大合并**：`verify:full`（或 CI 要等价的流水线）。

更上层的学习路径见 [文档体系总览](./doc-system.md)；新人步骤见 [新手上路](./onboarding.md)。

## 9. Git 钩子与提交信息

与根 `package.json` 一致：

| 机制            | 说明                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **engines**     | 根 `package.json` 的 `engines.node` / `engines.pnpm` 锁定运行环境；与新人文档、排障一致。                                                                             |
| **husky**       | 根 `prepare` 安装钩子；`.husky/pre-commit` 先跑 `check:refs`、`check:request-core`，再 `lint-staged`。`.husky/commit-msg` 跑 **commitlint**（Conventional Commits）。 |
| **lint-staged** | 根 `package.json#lint-staged`：**ESLint / Stylelint / Prettier** 仅作用于暂存区对应后缀（与全仓 `lint` / `lint:style` / `format` 互补）。                             |

交互式提交说明见根目录 `CONTRIBUTING.md`（本仓库**未**将 `commitizen` 列入 `devDependencies`，若团队需要可自行加装）。

## 10. 与 GitHub Actions 的对应

当前仓库在 PR/主分支上**未**统一跑 `verify:full` 的单一工作流；**文档站**由 [`.github/workflows/docs-github-pages.yml`](https://github.com/YanivWang/vue3-monorepo/blob/main/.github/workflows/docs-github-pages.yml) 在变更 `docs/**` 等路径时构建并发布至 GitHub Pages，见 [CI 与自动化](./ci-and-automation.md)。

若团队新增 `ci.yml` 在 PR 上跑 `lint` / `typecheck` / `test` 等，请同步更新**本页**与 **CI 与自动化**中的命令表，保持与 `package.json` 一致。
