# CI 与自动化

本仓库在 **GitHub Actions** 中的工作流以仓库内 `.github/workflows/*.yml` 为**唯一真源**。下列说明便于把「本地脚本」与「远端流水线」对齐；发版前完整本地预检仍以 [代码质量与规范约束](./quality-gates.md) 为准。

## 已配置工作流

| 文件                                                                                                                                      | 触发                                                                                                                        | 作用                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`.github/workflows/ci.yml`](https://github.com/YanivWang/vue3-monorepo/blob/main/.github/workflows/ci.yml)                               | 任意 `pull_request`；`push` 到 `main`/`master`；亦可 `workflow_dispatch`                                                    | 单 job 跑 `pnpm run verify:full`（全量约 30s），并把 `coverage/` 作为 artifact 上传（保留 7 天）                                   |
| [`.github/workflows/docs-github-pages.yml`](https://github.com/YanivWang/vue3-monorepo/blob/main/.github/workflows/docs-github-pages.yml) | `push` 到 `main`/`master` 且路径含 `docs/**`、`pnpm-lock.yaml`、`package.json` 或本 workflow 文件；亦可 `workflow_dispatch` | 在 `docs` 目录执行 `pnpm run build`（带 `VITEPRESS_BASE` / `VITEPRESS_NO_GIT`），将 `docs/.vitepress/dist` 发布到 **GitHub Pages** |

| [`.github/dependabot.yml`](https://github.com/YanivWang/vue3-monorepo/blob/main/.github/dependabot.yml) | 每周一 09:00（Asia/Shanghai）扫 npm；每月扫 github-actions | 把依赖升级变成可 review 的 PR。catalog 锁得住版本漂移，锁不住「一直旧下去」；PR 会跑 `ci.yml` 的 `verify:full`，升级有没有跑挂机器先告诉你。major 升级不由机器人推 |

**说明**：

- 构建步骤使用 pnpm 与 lockfile 安装依赖（`pnpm install --frozen-lockfile`），与本地一致。
- `VITEPRESS_BASE` 设为 `/<仓库名>/`，以适配 `https://<用户>.github.io/<仓库名>/` 的**项目站**路径；若使用 `username.github.io` 根站，需改为 `VITEPRESS_BASE=/` 再构建（见 [部署与 Docker](./deploy.md) 与 `docs/.vitepress/config.ts` 注释）。

## 与本地脚本的对应关系

| 场景              | 本地                                                                                    | CI（当前）                                                                              |
| ----------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 文档站生产构建    | 根执行 `pnpm run docs:build` 或在 `docs` 下 `pnpm run build`                            | `docs` 工作目录下 `pnpm run build`                                                      |
| 全量预检 / 发版前 | `pnpm run verify:full`                                                                  | `ci.yml` 的 `verify` job 跑**同一条** `verify:full`，PR 与 `main`/`master` 推送都会触发 |
| 贡献基线          | 见 [CONTRIBUTING](https://github.com/YanivWang/vue3-monorepo/blob/main/CONTRIBUTING.md) | 已由 `ci.yml` 覆盖（`verify:full` 内含 lint / typecheck / test / 构建）                 |

因为 CI 跑的就是根 `package.json` 里的 `verify:full` 一条命令，**本地与远端不会漂**：改门禁只需改那一条脚本，不必同时改 workflow。新增其他工作流时，仍请在本页与 [代码质量与规范约束](./quality-gates.md) 中同步命令清单。

## 为什么单 job 跑全部

`verify:full` 全量约 30 秒（引用检查 → 类型 → lint → stylelint → prettier → 测试+覆盖率 → admin/h5/docs 三个构建）。拆成多 job 并行省下的墙钟时间，还不如各 job 各自 `pnpm install` 的开销，反而让「哪一步红了」要跨 job 找。等它涨到分钟级再拆。
