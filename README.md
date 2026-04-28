# vue3-monorepo

**pnpm workspace 企业级 Monorepo**：以 `packages/shared` 与各应用**同仓协作**为枢纽；**PC 管理端（Element Plus）与移动端 H5（Vant 4 + Bridge）为两条同等重要的模板线**，并含 VitePress 文档站。默认各一条 **模板应用**（`pc-admin-template`、`h5-template`），仅供 `pnpm run create-app` 复制与开箱演示；**真实业务代码请在生成后的应用目录编写，勿在 `*-template` 内直接写业务**（约定见 [项目与目录约定](docs/guide/project-conventions.md)）。在根目录执行 **`pnpm run create-app`**，会在 `apps/pc/*` 或 `apps/h5/*` 下复制模板并接好根脚本、`tsconfig` references、`vitest.workspace.ts` 等（详见 [新增业务应用](docs/guide/adding-a-new-app.md)）。依赖版本以根目录 `package.json` 与 `pnpm-lock.yaml`（及 `pnpm-workspace.yaml` 中的 `catalog`）为准。

**在线文档站（企业级知识库、可搜索）**：[https://yanivwang.github.io/vue3-monorepo/](https://yanivwang.github.io/vue3-monorepo/)

**分工**：根 README 只做**入门索引与速查**；**完整说明、排障、环境变量、目录约定、CI、安全、性能等**均在文档站，与 [CONTRIBUTING.md](CONTRIBUTING.md) 及源码同步维护。本地 Markdown 源在 `docs/guide/` 等目录，不启动 `docs:dev` 也可在 IDE 中阅读。

| 你打算…… | 优先阅读 |
| --- | --- |
| 第一次 clone、装依赖、开 dev | [新人上手指南](docs/guide/onboarding.md) |
| 文档分几层、和 README 谁写什么 | [文档体系总览](docs/guide/doc-system.md) |
| `pnpm`、filter、新代码/依赖放哪 | [Monorepo 工作流](docs/guide/monorepo-workflow.md)、[项目与目录约定](docs/guide/project-conventions.md) |
| 新建 PC/H5 业务应用 | 根 `pnpm run create-app`，详见 [新增业务应用](docs/guide/adding-a-new-app.md) |
| `verify:full`、lint、test、构建 | [质量门禁与脚本](docs/guide/quality-gates.md) |
| 命令/端口、环境要求速查 | [环境与命令速查](docs/guide/getting-started.md) |
| 排障、环境变量、贡献与 PR、CI、架构细节 | 见文档站侧栏，或上表同路径下的 `.md` 文件 |

起文档站（常见端口 **5175**）：

```bash
pnpm run docs:dev
```

## 环境要求

| 项 | 要求 |
| --- | --- |
| Node.js | `>=20.19.5`（见根 `package.json` 的 `engines`） |
| 包管理器 | **pnpm** `>=10.17.0`（`packageManager` 与 `preinstall` 仅允许 pnpm，勿与 npm/yarn 混用） |

## 技术栈（摘要）

Vue 3、Vite、TypeScript、Vue Router、Pinia；PC 为 Element Plus，H5 为 Vant 4 与 Bridge；请求封装在 `@vue3-monorepo/shared/request-*`。

**主题与 Design Token**：深浅模式为 `light` / `dark` / `system`（`ThemeMode` 见 `@vue3-monorepo/shared/enums`），运行时通过 `applyThemeMode` 切换 `html` 的 `.dark` class；**品牌色**为多套预设（`BrandId`：`blue` / `green` / `red` / `orange` / `purple`），通过 `applyBrand` 设置 `html[data-brand]`，色值由 `@vue3-monorepo/shared` 下 SCSS（`tokens/_brands.scss` 等）提供。模板内由 Pinia `app` store 的 `setTheme` / `setBrand` 调用上述 API（`system` 模式下 store 另用 `themeTick` 配合系统配色变化）；也可在**无全局 store** 的场景使用 `@vue3-monorepo/shared/hooks-core` 的 `createUseTheme`（H5 另有 `createUseThemeH5` 可联动 Vant Locale）。PC 模板在**顶栏**与**登录页**提供**品牌色 + 主题模式**切换；H5 模板在「主题」示例页等处可调品牌与模式（详见应用内路由）。

Sass 侧：各端 `vite.config` 的 `css.preprocessorOptions.scss.additionalData` 注入 `@use "@vue3-monorepo/shared/styles/tokens/variables" as *;`，单文件组件内可直接使用 `$spacing-*` 等。**PC** 全局样式在 `src/assets/styles/index.scss` 中 `@use` 共享 `tokens/root`、`tokens/brands` 与本应用 `dark.scss`（含 Element Plus `--el-*` 对齐）。**H5** 全局样式在 `src/styles/index.scss` 中以仓库相对路径 `@use` 共享 `tokens/index.scss`（内含 root、brands、共享 `dark.scss`），并映射 Vant CSS 变量。完整说明见 [主题、暗黑与品牌色](docs/guide/theme.md)、[Design Token](docs/guide/design-tokens.md)、[架构说明](docs/guide/architecture.md)。

## 仓库结构

```
vue3-monorepo/
├── apps/pc/pc-admin-template/   # PC 模板（@vue3-monorepo/admin），dev 5173；勿写业务
├── apps/pc/<业务目录>/          # PC 业务应用（须 create-app 生成）
├── apps/h5/h5-template/         # H5 模板（@vue3-monorepo/h5），dev 5174；勿写业务
├── apps/h5/<业务目录>/          # H5 业务应用（须 create-app 生成）
├── docs/                        # VitePress（@vue3-monorepo/docs），dev 5175
├── packages/shared/             # @vue3-monorepo/shared
├── scripts/                     # create-app、check-refs、check-request-core、docker 封装等
├── docker/                      # compose、各端 Dockerfile、nginx
├── pnpm-workspace.yaml
└── package.json
```

根脚本 `pnpm run dev` 会对**所有**在子包中声明了 `dev` 的 workspace **并行**启动（默认三端 + 你新增的 app）；机器资源紧张时建议只用 `admin:dev` / `h5:dev` / `docs:dev` 或某个 `前缀:dev` 单开。

## 快速开始

**仓库**：<https://github.com/YanivWang/vue3-monorepo>

```bash
git clone https://github.com/YanivWang/vue3-monorepo.git
cd vue3-monorepo
pnpm install
pnpm run admin:dev    # 或 pnpm run h5:dev / pnpm run docs:dev
```

发版/合并前可在本地执行 `pnpm run verify:full`（见 [质量门禁与脚本](docs/guide/quality-gates.md)）。

## 根目录脚本（摘录）

| 用途 | 命令 |
| --- | --- |
| 开发 | `pnpm run admin:dev` / `pnpm run h5:dev` / `pnpm run docs:dev` |
| 新建 PC/H5 业务应用 | `pnpm run create-app`（见 [新增业务应用](docs/guide/adding-a-new-app.md)） |
| 全 workspace 类型检查 | `pnpm run typecheck` |
| 全量校验 | `pnpm run verify:full` |
| 全仓测试 | `pnpm run test` |
| 构建三端 | `pnpm run build` |
| 清依赖重装（排障） | `pnpm run clean:install` |

**完整命令表与使用场景**见 [质量门禁与脚本](docs/guide/quality-gates.md)。**Husky、提交信息、PR** 见 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [贡献与协作](docs/guide/contributing.md)。

## 常见问题（摘录）

- **Node / pnpm 版本不符**：见上文 [环境要求](#环境要求)；仍异常见 [排障与 FAQ](docs/guide/troubleshooting.md)。
- **只支持 pnpm**：勿使用 `npm install` / `yarn`。
- **脚本与 CI 在跑什么**：[质量门禁与脚本](docs/guide/quality-gates.md)、[CI 与自动化](docs/guide/ci-and-automation.md)。

## 许可证

[MIT](LICENSE)
