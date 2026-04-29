# CI 与自动化

本仓库在 **GitHub Actions** 中的工作流以仓库内 `.github/workflows/*.yml` 为**唯一真源**。下列说明便于把「本地脚本」与「远端流水线」对齐；发版前完整本地预检仍以 [代码质量与规范约束](./quality-gates.md) 为准。

## 已配置工作流

| 文件                                                                                                                                      | 触发                                                                                                                        | 作用                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`.github/workflows/docs-github-pages.yml`](https://github.com/YanivWang/vue3-monorepo/blob/main/.github/workflows/docs-github-pages.yml) | `push` 到 `main`/`master` 且路径含 `docs/**`、`pnpm-lock.yaml`、`package.json` 或本 workflow 文件；亦可 `workflow_dispatch` | 在 `docs` 目录执行 `pnpm run build`（带 `VITEPRESS_BASE` / `VITEPRESS_NO_GIT`），将 `docs/.vitepress/dist` 发布到 **GitHub Pages** |

**说明**：

- 构建步骤使用 pnpm 与 lockfile 安装依赖（`pnpm install --frozen-lockfile`），与本地一致。
- `VITEPRESS_BASE` 设为 `/<仓库名>/`，以适配 `https://<用户>.github.io/<仓库名>/` 的**项目站**路径；若使用 `username.github.io` 根站，需改为 `VITEPRESS_BASE=/` 再构建（见 [部署与 Docker](./deploy.md) 与 `docs/.vitepress/config.ts` 注释）。

## 与本地脚本的对应关系

| 场景              | 本地                                                                                    | CI（当前）                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 文档站生产构建    | 根执行 `pnpm run docs:build` 或在 `docs` 下 `pnpm run build`                            | `docs` 工作目录下 `pnpm run build`                                                          |
| 全量预检 / 发版前 | `pnpm run verify:full`                                                                  | **无**全仓统一 job；若团队需要，可新增 workflow 在 PR 上跑 `verify:full` 子集（与成本权衡） |
| 贡献基线          | 见 [CONTRIBUTING](https://github.com/YanivWang/vue3-monorepo/blob/main/CONTRIBUTING.md) | 可按团队策略增加 `ci.yml` 跑 `lint` / `typecheck` / `test` 等                               |

若后续增加「PR 上跑 eslint + test」等工作流，请在本页与 [代码质量与规范约束](./quality-gates.md) 中同步**命令清单**，避免描述与 `package.json` 漂移。
