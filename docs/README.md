# @vue3-monorepo/docs

VitePress 文档包：「**文档体系总览**」、新人上手、Monorepo 工作流、质量门禁、架构与组件说明。

## 与根 README 的分工

- **根 `README.md`**：环境、目录、脚本表、环境变量、故障速查、目录约定；保持精炼。
- **本目录**：可浏览、可搜索的完整说明；**总览**从 [`guide/doc-system.md`](./guide/doc-system.md) 开始。

## 本地开发

在仓库**根**执行（默认 `http://127.0.0.1:5175` 左右，以终端为准）：

```bash
pnpm run docs:dev
```

构建与预览见根 `package.json` 的 `docs:build`、`docs:preview`。

## 目录（节选）

```
docs/
├── .vitepress/config.ts
├── index.md
├── guide/
│   ├── doc-system.md  # 文档体系总览
│   ├── onboarding.md           # 新人第一天
│   ├── getting-started.md      # 环境与命令速查
│   ├── monorepo-workflow.md    # pnpm、filter、新代码放哪
│   ├── quality-gates.md        # verify:full、lint、test
│   ├── architecture.md …
├── components/                 # 业务/共享组件文档
└── package.json
```

H5 与宿主的 **JSBridge 协议**在应用内：`../apps/h5/h5-template/docs/bridge-protocol.md`（不放在 VitePress 中，根 README 有入口说明）。

## 维护

组件或对外能力变更时，请同步更新本包相应页面，并遵守根目录 `CONTRIBUTING.md`。
