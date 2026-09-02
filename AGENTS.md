# AGENTS.md

面向 AI 编码 agent 的项目说明。人读的完整版在 [`README.md`](README.md) 与文档站 [`docs/`](docs/guide/doc-system.md)。

vue3-monorepo 是一个 pnpm workspace：`apps/pc/*`（Element Plus 后台）+ `apps/h5/*`（Vant 移动端）+ `packages/*`（shared / request-core / web-monitor / js-bridge）+ VitePress 文档站。

## 命令

```shell
pnpm run verify:full   # 统一门禁，提交前跑这个；CI 跑的是同一条
```

它按顺序执行：`check:refs` → `check:request-core` → `check:workspace` → `check:toolchain` → `check:audit` → `check:theme` → `typecheck` → `lint` → `check:boundaries` → `lint:style` → `prettier --check .` → `test:coverage` → `build`。全量约 45s。

单项：`pnpm run typecheck` / `lint` / `test` / `test:coverage`。单应用：`admin:dev`、`h5:dev`、`docs:dev`。

## 环境硬约束

- Node 与 pnpm 版本以 `.nvmrc`（22.23.2）与 `packageManager`（pnpm 11.24.0）为**单一真源**，CI 用 `node-version-file` 读同一份，Dockerfile 只写 `FROM node:22-alpine` + `corepack enable`（不钉 pnpm 版本）。改版本时 `.nvmrc` / `engines` / `packageManager` / `@types/node` / Dockerfile 一起动，`check:toolchain` 会拦漂移。
- **Node 停在 22 是刻意的，不是漂移。** 当前 Active LTS 是 24，22 已进入 Maintenance LTS（支持到 2027-04）——这条是团队运行环境决定的，不走「跟随当前大版本」那条通则。
  下限必须写 `22.23.2` 而不是 `22`：依赖里已经有钉到 22.22.x 的（`lint-staged` 要 `>=22.22.1`，`abbrev` / `nopt` 要 `^22.22.2`），写宽了 `engine-strict` 就拦不住装在 22.12 上却跑不起来的情况。
  升级窗口：22 的 EOL（2027-04）之前必须迁到 24 或更高，届时 `.nvmrc` / `engines` / `@types/node` / Dockerfile 一起动。
- `preinstall` 挂了 `only-allow pnpm`，`.npmrc` 开了 `engine-strict`。不要用 npm / yarn。
- 依赖的 postinstall 默认被拦截，放行清单在 `pnpm-workspace.yaml` 的 `allowBuilds`（pnpm 11 的名字，10 时叫 `onlyBuiltDependencies`）。新增需要构建脚本的依赖时要显式加进去。
- 依赖版本统一走 `pnpm-workspace.yaml` 的 `catalog:`，各包写 `"vue": "catalog:"`。**不要在子包 package.json 里写死版本号。**

## 门禁：改动前先知道哪几件会拦你

| 门禁                 | 拦什么                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `check:refs`         | workspace 命名、`tsconfig.base.json` 的 paths、根 `references`（双向）、`workspace:*` 依赖是否自洽 |
| `check:request-core` | `packages/request-core/src` 出现 UI 反馈类 API 关键字（`ElMessage`、`showToast` 等）               |
| `check:workspace`    | 新包漏写 `typecheck` 脚本、含测试文件却没挂进 `vitest.config.ts` 的 `test.projects`                |
| `check:audit`        | 出现基线外的 high 级依赖公告；`critical` 一律不允许，不接受基线豁免                                |
| `check:theme`        | 主题产物被手改，或改了 `theme-palette.json` 忘了重新生成                                           |
| `check:toolchain`    | Node / pnpm 版本在 `.nvmrc`、`engines`、`packageManager`、Dockerfile、workflow 之间漂移            |
| `check:boundaries`   | 架构边界规则本身失效（造一批应当被拦的 import，确认真的被拦下）                                    |

**新增 workspace 包时必做四件事**，否则 `check:workspace` / `check:refs` 会失败：

1. 声明 `typecheck` 脚本 —— 根 `typecheck` 带 `--if-present`，没有脚本就**静默跳过**，这个包等于没有类型检查；
2. 有测试就挂进根 `vitest.config.ts` 的 `test.projects` —— 那是显式清单，不在里面的包测试**根本不跑**且不报错；
3. 有测试就补 `tsconfig.vitest.json`，并让 `typecheck` 脚本把它一起跑 —— 主 tsconfig 排除了 `*.spec.ts`（源码工程不该拿到 Node 全局），少这份配置等于测试代码不做类型检查；
4. 挂进根 `tsconfig.json` 的 `references` —— 漏挂只是不参与 `tsc -b` 与 IDE 工程引用，同样不报错。

四个洞的共性都是「失败时表现为通过」，所以才各配了一道门禁。

## 依赖升级：跟主流，不要攒

- 版本基线跟随各生态的**当前稳定大版本**；刻意落后的只有 catalog 里写了理由的那几条（当前是 `typescript`，被 typescript-eslint 的 peer 范围卡在 6.x）。
- dependabot **不再整体 ignore major**：major 单独分组开 PR，由人读 changelog 后合。之前「忽略 major 交给人主动发起」的结果是没人发起，攒到 vite 落后 3 个大版本。
- 传递依赖的安全公告优先用 `pnpm-workspace.yaml` 的 `overrides` 顶掉，而不是写进 `scripts/audit-baseline.json`。
- 新版本有 24 小时冷却期（pnpm 的 `minimumReleaseAge`）。安装时若自动往 `minimumReleaseAgeExclude` 追加了行，说明这次引入了发布不足一天的版本，review 时多看一眼。

## 基线是棘轮，只降不升

- 依赖公告基线：`scripts/audit-baseline.json`，**当前为空**（high / critical 均为 0）。往里加条目之前先想清楚能不能用 `pnpm-workspace.yaml` 的 `overrides` 顶掉传递依赖——写进基线只是把问题藏起来。清掉一批后跑 `pnpm run check:audit:update` 收紧；`critical` 拒绝写入基线。
- 覆盖率阈值：**只在根 `vitest.config.ts` 的 `test.coverage.thresholds`**，当前 stmts/lines 12、funcs/branch 10。**只能往上抬**，补了测试后跑 `pnpm run test:coverage` 看新水位再改。（数字比 vitest 3 时代低是因为换了量法：v8 provider 现在对未加载文件如实记 0，而不是记 100% 分支——详见该文件注释。）
  各 app 自己的 `vitest.config.ts` 刻意不写 `thresholds`：项目级 coverage 配置在 `test.projects` 下整体不生效，写了也没人执行，只会让 `pnpm --filter ... test:coverage` 无故变红。

不要为了让门禁变绿而放宽基线或阈值——那等于把问题洗成历史包袱。

## 架构：依赖方向是硬规则

分层边界由 `eslint.config.mjs` 的 `import-x/no-restricted-paths` 与 `no-restricted-imports` 强制，违反是 lint **error** 不是 warning：

- 端侧**整组**互斥：`components-pc` / `directives-pc` / `hooks-pc` / `request-pc` 禁止 import 任何 `*-h5`，反之亦然（不只是同类型两两配对——`components-pc` 引 `hooks-h5` 同样会把 Vant 拖进 PC 产物）
- `packages/request-core` 禁止反依赖端侧 preset，禁止 import 任何 UI 库（`element-plus` / `vant`）
- `shared/hooks-core` 禁止依赖端侧 UI；`shared/request-pc|h5` 禁止直接 import `axios`，必须走 `request-core`
- `packages/shared` 禁止反依赖 `apps/`；两个 app 禁止互引源码
- `packages/js-bridge` 禁止依赖 `@vue3-monorepo/shared`

需要跨层复用时，把公共部分下沉到更底层的包，不要绕过规则。

`import-x/no-restricted-paths` 依赖 `eslint-import-resolver-typescript`（配在 `eslint.config.mjs` 的 `settings['import-x/resolver']`）：**解析不到的 import 会被这条规则静默跳过**，没有 resolver 时全部 zone 形同虚设。这条依赖不是可选项。`check:boundaries` 就是为它写的常驻反例，resolver 一掉就红。

## 类型与 lint

- `apps/*/*/src/**/*.ts` 与 `packages/*/src/**/*.ts` 开了 `recommendedTypeChecked`。漏 `await` 的 Promise、把 async 函数当同步回调传，都是 error。
- 作用域刻意不含配置文件与 `.vue`：配置文件不在业务 tsconfig 的 include 里，纳入会报 `not found by the project service`。
- 有三条规则被显式关掉，理由写在 `eslint.config.mjs` 对应位置（`require-await` / `unbound-method` / `no-unused-vars`）。**关规则前先确认是误报，并把理由写进配置。**
- `tsconfig.base.json` 开了 `noUncheckedIndexedAccess` 与 `verbatimModuleSyntax`。下标访问要判空，不要用 `as` 绕过。

## 编辑器配置入库

`.vscode/settings.json` 与 `extensions.json` 是**跟进版本控制的**（`.gitignore` 里单独放行）。`formatOnSave` 开、`detectIndentation` 关。改这两个文件等于改团队配置，不是改个人偏好。

## 测试布局

根 `vitest.config.ts` 的 `test.projects` 列出参与的包；各包自己的 `vitest.config.ts` 定 environment 与 include。测试文件与被测源码同目录，命名 `*.spec.ts`。

## Git

- 在哪个分支改就在哪个分支提交，不要为了提交新建分支。
- commit 走 Conventional Commits，`type` 与 `scope` 都有白名单（见 `commitlint.config.ts`），正文每行 ≤100 字符。**scope 用不在白名单里的值会被 `commit-msg` 钩子直接拒绝。**
- `pre-commit` 跑 `check:refs` + `check:request-core` + `check:workspace` + `lint-staged`。lint-staged 里 eslint 带 `--fix`、prettier 带 `--write`。

## 引入新方案时：主流优先，不要自创

需要引入基线里没有的工具或写法时，按这个优先级找依据：该技术栈的官方推荐 →
主流脚手架的默认产物 → 工具自身的默认值 → 生态里的成熟工具。**偏离工具默认值必须
写得出理由**；确实要自己写脚本时，在文件头写明「为什么现有工具不够用」。

不要采用已弃用或即将移除的 API，也不要为了对齐某个参考项目而硬套用不上的结构。
完整判断顺序见 [可推广的工程化基线](docs/guide/portable-baseline.md) 的第零节。

## 给门禁写反例

新增或修改门禁时，**必须实测它会红**：构造一个应当被拦的输入，确认命令以非零码退出，再还原。没做过反例验证的门禁只能算配置——最贵的洞不是报错的门禁，是失败时表现为「通过」的门禁（本仓库已修掉两处这样的洞，见 `scripts/check-workspace-scripts.mjs` 的文件头）。

## 延伸文档

- [代码质量与规范约束](docs/guide/quality-gates.md) —— 每道门禁的完整说明与验证方法
- [可推广的工程化基线](docs/guide/portable-baseline.md) —— **要把这套配置搬到别的项目时读这份**：哪些能原样抄、哪些只是骨架、哪些搬不了
- [落地基线的 Prompt 模板](docs/guide/apply-baseline-prompt.md) —— 把基线交给 agent 去落地时的起手 prompt
