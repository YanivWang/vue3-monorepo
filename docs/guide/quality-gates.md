# 代码质量与规范约束

把根 `package.json` 里的**常用脚本**说明白：什么时候跑、失败代表什么、和发版/PR 怎么对齐。根 `README.md` 的「常用命令」表是**极简索引**，本页是**完整说明**；与 **GitHub Actions** 的对应见 [CI 与自动化](./ci-and-automation.md)。

## 1. 日常开发最常用

| 命令                                                           | 作用                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run admin:dev` / `pnpm run h5:dev` / `pnpm run docs:dev` | 单端本地开发，节省资源可只开一个                                                                                                                                                                                                                               |
| `pnpm run typecheck`                                           | **全 workspace** 并行 `typecheck`；改 shared 后必跑，避免只绿一端                                                                                                                                                                                              |
| `pnpm run typecheck:packages`                                  | 根脚本为 `pnpm --filter './packages/**' ... typecheck`：当前仓库 **`packages/shared`、`packages/request-core`、`packages/web-monitor`、`packages/js-bridge`** 均声明了 `typecheck` 时会并行执行；**不含** `docs`、`apps`（与根 `typecheck` 全 workspace 不同） |
| `pnpm run lint`                                                | 全仓 ESLint                                                                                                                                                                                                                                                    |
| `pnpm run lint:style`                                          | Stylelint，覆盖 scss/vue/css 等                                                                                                                                                                                                                                |
| `pnpm run format`                                              | Prettier 全仓**写入**；提交前可配合用                                                                                                                                                                                                                          |
| `pnpm run test:run`                                            | Vitest 单次跑（与根脚本别名 `test` 一致，见下）                                                                                                                                                                                                                |

> 单应用类型检查（更快定位）：`pnpm run admin:typecheck`、`pnpm run h5:typecheck`。

## 2. 测试

在**仓库根**执行时，Vitest 读取根 `vitest.config.ts` 的 **`test.projects`**（vitest 3 起取代已弃用的 `vitest.workspace.ts`）。默认至少包含：

- `apps/pc/pc-admin-template`（模板包，与业务应用并列进 workspace）
- `apps/h5/h5-template`（同上）
- `packages/shared`
- `packages/js-bridge`（Bridge 策略与 `createBridge` 等单测）
- `packages/request-core`（`utils` 纯函数单测）
- `packages/web-monitor`（监控投递 `postJsonReport` 的降级链路单测）

使用 `pnpm run create-app` 时，脚本会把**新应用目录**追加进 `test.projects`（与根 `pnpm test` 一致；新包内测试脚本与用例仍以模板为准）。**不包含** 文档包 `@vue3-monorepo/docs`（文档站不进该 workspace）。因此 `pnpm run test:run` 跑的是 **workspace 文件里列出的 project** 的测试，而不是「全 monorepo 每个包各跑一遍」。

| 命令                                       | 作用                                                                                                                                                                                                                                                        |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run test:run` / `pnpm run test`      | 在根执行 Vitest **单次**，使用上述 `vitest.workspace.ts`                                                                                                                                                                                                    |
| `pnpm run test:watch`                      | 交互/watch，适合 TDD                                                                                                                                                                                                                                        |
| `pnpm run test:coverage`                   | 覆盖率，**阈值已开**（`vitest.config.ts` 的 `test.coverage.thresholds`）。数值取自接入当天实测水位，作用是**防退化**而非达标；跌破即失败，`verify:full` 与 CI 跑的都是这条                                                                                  |
| `pnpm run admin:test` / `pnpm run h5:test` | `pnpm --filter` 在**单包目录**内执行各 app 的 `test` 脚本；配置以各应用自己的 `vitest.config.ts` 为准。若某包**未**声明 `test`，pnpm 会提示无脚本且**仍以 0 退出**，容易误以为跑过测试——现在这一类「静默通过」由 `pnpm run check:workspace` 兜住（见 §4）。 |

根 `verify:full` 里串联的是**根** `test:coverage`（同一批用例，额外校验覆盖率阈值）；若只关心某一 app，可在该 app 下单独跑 `admin:test` / `h5:test`。

## 3. 全量校验 `verify:full`

根 `package.json` 中**一字不差**的链为：

`check:refs` → `check:request-core` → `check:workspace` → `check:audit` → `check:theme` → `typecheck` → `lint` → `lint:style` → `prettier --check .` → `test:coverage` → `build`

其中 `build` 即 `admin:build` → `h5:build` → `docs:build`。

**适合**：合并前、发版前、大改 `shared` 后做一次完整体检。**CI 上跑的就是这一条**（`.github/workflows/ci.yml`，PR 与 `main`/`master` 推送触发），所以它不再是「接近 CI」，而是**与 CI 同一条命令**。

**注意**：`build` 会构建三端，耗时较长；日常只改文档时可用 `pnpm run docs:build` 等分段命令代替，不必每次 `verify:full`。

## 4. 仓库特有五项检查

实现以仓库内脚本为准，摘要如下（详见 `scripts/` 下对应脚本的文件头注释）：

| 命令                          | 含义                                                                                                                                                                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run check:refs`         | `scripts/check-refs.js`：workspace 包数量/命名、`tsconfig.base.json` paths 与 `tsconfig.json` references、各包 `workspace:*` 依赖是否**能在当前 workspace 解析**等（**不是**简单的「import 路径字符串扫描」）                                                                                      |
| `pnpm run check:request-core` | `scripts/check-request-core.js`：扫描 **`@vue3-monorepo/request-core`** 源码目录 `packages/request-core/src` 下 `.ts`，**禁止**出现 Element Plus / Vant 等 **UI 反馈类 API 关键字**（如 `ElMessage`、`showToast` 等），防止请求核心层与弹窗/Toast 耦合；与「npm 依赖树是否含 UI 包」不是同一类检查 |
| `pnpm run check:workspace`    | `scripts/check-workspace-scripts.mjs`：堵「门禁静默跳过」的两个洞——① 根 `typecheck` 带 `--if-present`，新包漏写 `typecheck` 脚本会被**无声跳过**；② `vitest.workspace.ts` 是显式清单，不在其中的包写了测试也**不会被 `pnpm test` 发现**。两者的失败表现都是「通过」，本脚本把它们变成显式失败      |
| `pnpm run check:audit`        | `scripts/check-audit.mjs`：依赖安全公告的**棘轮门禁**。按 GHSA ID 记基线，基线外的一律失败；`critical` 级不入基线（`--update` 拒绝写入），必须当场处理。固定查询官方 registry（私有源/镜像没有 audit 端点）。离线时用 `SKIP_AUDIT=1` 显式跳过——查不到公告会**直接失败**，不会「查不动就当通过」    |
| `pnpm run check:theme`        | `scripts/check-theme.mjs`：重跑 `generate:theme` 后用 `git status --porcelain` 比对 `_variables.scss`、`_brands.scss`、`_dark.scss`、`_dark-element.scss`、`brands.config.ts` 五个 AUTO-GENERATED 产物；有 diff 说明产物被手改或忘了重新生成（见 [Design Token](./design-tokens.md)）              |

在改 `packages/shared` 下请求、路径、exports 时，**务必**跑通前两项；改 `theme-palette.json` 或主题产物时补跑 `check:theme`。

> `.husky/pre-commit` 跑 `check:refs` + `check:request-core` + `check:workspace` + `lint-staged`（三个检查都是毫秒级的纯元数据校验）；`check:theme` 仅在 `verify:full` 与 CI 中执行。

## 4.1 ESLint 里的依赖边界门禁

除了上面的脚本，根 `eslint.config.mjs` 还用 `import/no-restricted-paths` 与 `no-restricted-imports` 把**分层边界**做成了 lint 错误（`pnpm run lint` 即可发现）：

| 规则                                                                             | 约束                                                            |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `components-pc` ⇄ `components-h5`（`directives-*`、`hooks-*`、`request-*` 同理） | 端侧同类型包**互相禁止** import                                 |
| `packages/request-core` ← `shared/request-pc`、`request-h5`                      | 内核**禁止反依赖**端侧 preset                                   |
| `shared/hooks-core` ← 任意端侧包                                                 | 通用 hooks **禁止依赖**端侧 UI 层                               |
| `packages/shared` ← `apps/**`                                                    | 共享包**禁止反依赖**应用                                        |
| `pc-admin-template` ⇄ `h5-template`                                              | 两端**禁止互引源码**（store / 页面不共享）                      |
| `packages/request-core/**`                                                       | 禁止 `import` `element-plus` / `vant`                           |
| `shared/request-pc`、`request-h5`                                                | 禁止直接 `import axios`，必须走 `@vue3-monorepo/request-core`   |
| `shared/hooks-core/**`                                                           | 禁止 `import` `element-plus` / `vant`                           |
| `packages/js-bridge/**`                                                          | 禁止 `import` `@vue3-monorepo/shared`（保持 bridge 无上层依赖） |

也就是说，[项目与目录约定](./project-conventions.md) 与 [pnpm workspace 日常操作](./monorepo-workflow.md) 里的「强约束」不只是文字规范，越界会在 `lint` 阶段直接报错。

## 4.2 类型感知 lint（type-aware linting）

`apps/*/*/src/**/*.ts` 与 `packages/*/src/**/*.ts` 额外启用了 `typescript-eslint` 的
`recommendedTypeChecked`（`parserOptions.projectService: true`）。这一档规则要读类型信息才能判断，
是 `tsc` **不会**报、普通 lint 也**看不见**的一类问题：

| 规则                        | 拦什么                                                         |
| --------------------------- | -------------------------------------------------------------- |
| `no-floating-promises`      | 漏 `await` 的 Promise——失败被静默吞掉，最常见的线上问题之一    |
| `no-misused-promises`       | 把 async 函数传给只接受同步回调的地方（事件监听器、`forEach`） |
| `no-unsafe-*`               | 对 `any` 值的不安全赋值/调用                                   |
| `no-base-to-string`         | 把对象拼进字符串，得到 `[object Object]`                       |
| `no-unsafe-enum-comparison` | 枚举与裸 number 比较                                           |

**作用域刻意不铺满**：配置文件（`vite.config.ts` 等）不在业务 tsconfig 的 include 里，开了会报
`not found by the project service`；`.vue` 走 `vue-eslint-parser`，类型感知开销大且噪声高。
两者都等有明确需要时再单独开一档。

有三条规则被显式关掉（理由写在 `eslint.config.mjs` 对应位置）：`require-await`（js-bridge 各宿主
策略要实现同一套异步契约，同步实现也必须是 `async`）、`unbound-method`（命中的全是组合式函数返回的
闭包，没有 `this` 可丢）、`no-unused-vars`（全仓已约定交给 tsc 的 `noUnusedLocals` /
`noUnusedParameters`，两边都开会重复报）。

## 5. 构建与预览

| 命令                                            | 作用                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm run build`                                | 顺序 build admin → h5 → docs（`admin:build` / `h5:build` 会先跑 `generate:theme`） |
| `pnpm run admin:build` 等                       | 单端 build                                                                         |
| `pnpm run docs:preview`                         | 文档先 `docs:build` 后本地静态预览                                                 |
| `pnpm --filter @vue3-monorepo/admin preview` 等 | 各 app 的 `vite preview`；命令清单见上表与本页上文                                 |

## 6. 依赖重装与排障

| 命令                     | 作用                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `pnpm run clean:install` | 清根与各 workspace 下 `node_modules` 后重装；可加 `--` 传 `-y` 跳过确认，见 `scripts/clean-install.sh` |

**典型场景**：lockfile 大合并冲突后、怀疑本地装坏。仍勿随意**手改** `pnpm-lock.yaml`。

## 7. 与 PR / 贡献指南对齐

`CONTRIBUTING.md` 中的 PR 前检查是**基线**（`lint`、`lint:style`、`type-check`（同 `typecheck`）、`test:run`、`build`）。根 `verify:full` 在**此基础上**还包含 `check:refs`、`check:request-core`、`prettier --check .`（顺序见上一节），更适合作为发版/大改前的「一键」预检；与团队 CI 对齐即可。

## 8. 对照表速记

- **5 分钟本地反馈**：`typecheck` + 正在改的一端 `dev`。
- **提 PR 前**：至少 `typecheck` + `lint` + `test:run`；改 **`@vue3-monorepo/shared`**、**`@vue3-monorepo/request-core`**、**`@vue3-monorepo/js-bridge`**、**`@vue3-monorepo/web-monitor`** 等 workspace 包时加 `check:refs` + `check:request-core`；改主题色板时加 `check:theme`。
- **发版/大合并**：`verify:full`（或 CI 要等价的流水线）。

更上层的学习路径见 [文档体系总览](./doc-system.md)；新人步骤见 [新手上路](./onboarding.md)。

## 8.5 编辑器层（入库的 `.vscode`）

门禁分三层：**编辑器**（写下的那一刻）→ **提交钩子**（秒级、只看改动文件）→ **CI**（合并前，唯一绕不过的一层）。
前两层成本低、反馈快，但只对配好的人生效——所以配置必须入库，不能留在个人全局设置里。

`.gitignore` 整体忽略 `.vscode/`，但**放行 `settings.json` 与 `extensions.json`**：

| 设置                                                    | 作用                                                                                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `editor.formatOnSave` + prettier 为各语言默认 formatter | 保存即成型，格式问题不会攒到提交时才被 lint-staged 改一遍                                                                        |
| `editor.codeActionsOnSave`（eslint / stylelint fixAll） | 可自动修的 lint 问题在保存时就修掉                                                                                               |
| `editor.detectIndentation: false`                       | **必须显式关掉**。它缺省为 `true`，会按文件已有缩进覆盖 `tabSize`，历史上是 4 空格的文件就永远自我延续，`.editorconfig` 也压不住 |
| `typescript.tsdk`                                       | 用仓库锁定的 TS 版本，而不是编辑器自带的                                                                                         |

> 这一层只是加速反馈，**不承担拦截职责**——真正的拦截在 `verify:full` 与 CI。
> 编辑器没配好的人提交同样会被钩子和 CI 拦住，只是反馈来得晚一些。

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
