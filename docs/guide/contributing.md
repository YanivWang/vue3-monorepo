# 贡献与协作

本页为文档站**入口**；**完整、可执行**的规范以仓库根目录 Markdown 为准（分支、PR、提交信息、代码风格、**与代码同步更新文档**的义务等）。

- **[CONTRIBUTING.md](https://github.com/YanivWang/vue3-monorepo/blob/main/CONTRIBUTING.md)**：分支与 PR 流程、Conventional Commits、PR 前检查、文档维护约定。

**提交与 Husky**（摘要）：根目录 `pnpm install` 触发 `prepare` 安装 `pre-commit`（lint-staged）与 `commit-msg`（commitlint）。`HUSKY=0 git commit` 可临时跳过（不建议长期使用）。

**提 PR 前**建议至少与 `CONTRIBUTING` 中基线一致；大改前可执行根目录 `pnpm run verify:full`，详见 [质量门禁与脚本](./quality-gates.md)。
