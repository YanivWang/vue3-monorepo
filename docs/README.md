# @vue3-monorepo/docs

VitePress 文档包：「**文档体系总览**」、新人上手、Monorepo 现代化工程管理方案、代码质量与规范约束、架构与组件说明。**叙述立场**：**Monorepo（pnpm workspace）** 为协作核心；**PC Admin 与 H5** 在脚手架与文档中**地位对等**（某页以一端展开细节，不代表另一端次要）。

## 与根 README 的分工

- **根 `README.md`**：入口介绍、环境、目录、快链、脚本**摘录**；长文与多表在 `guide/` 各专页（见 `doc-system` 交叉索引）。
- **本目录**：可浏览、可搜索的**企业级展开层**；**总览**从 [`guide/doc-system.md`](./guide/doc-system.md) 开始。

## 本地开发

在仓库**根**执行（默认 `http://127.0.0.1:5175` 左右，以终端为准）：

```bash
pnpm run docs:dev
```

构建与预览见根 `package.json` 的 `docs:build`、`docs:preview`。

## 目录（节选）

侧栏分组与下列文件对应（以 `.vitepress/config.ts` 为准）。

```
docs/
├── .vitepress/config.ts        # 站点主题、侧栏（guide / components）、端口 5175
├── index.md                    # 首页
├── guide/                      # 指南（入门与工程化 / 架构与实践 / 发布与 CI）
│   ├── doc-system.md
│   ├── onboarding.md
│   ├── getting-started.md
│   ├── adding-a-new-app.md
│   ├── monorepo-introduce.md
│   ├── monorepo-workflow.md
│   ├── quality-gates.md
│   ├── project-conventions.md
│   ├── troubleshooting.md
│   ├── environment-variables.md
│   ├── contributing.md
│   ├── architecture.md
│   ├── permission.md
│   ├── theme.md
│   ├── design-tokens.md
│   ├── i18n.md
│   ├── http-and-mock.md
│   ├── errors-and-observability.md
│   ├── web-vitals.md
│   ├── performance.md
│   ├── security.md
│   ├── branch-strategy.md
│   ├── deploy.md
│   └── ci-and-automation.md
├── components/                 # 共享组件用法（与侧栏「组件」一致）
│   ├── error-boundary.md
│   ├── page-container.md
│   ├── pro-table.md
│   ├── skeleton.md
│   └── svg-icon.md
└── package.json                # @vue3-monorepo/docs
```

Monorepo 内其它 workspace 包（根目录 **`packages/request-core`**、**`web-monitor`**、**`js-bridge`**、**`shared`**）的职责与依赖关系见根 **`README.md`** 与 [架构说明](./guide/architecture.md)。

H5 与宿主的 **JSBridge 协议**在应用内：`../apps/h5/h5-template/docs/bridge-protocol.md`；入口见 [项目与目录约定](./guide/project-conventions.md) 等页。

## 维护

组件或对外能力变更时，请同步更新本包相应页面（含 `guide/` 与 `components/`），并遵守仓库根目录 [`CONTRIBUTING.md`](https://github.com/YanivWang/vue3-monorepo/blob/main/CONTRIBUTING.md)。
