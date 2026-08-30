# CI 与自动化

本仓库在 **GitHub Actions** 中的工作流以仓库内 `.github/workflows/*.yml` 为**唯一真源**。下列说明便于把「本地脚本」与「远端流水线」对齐；发版前完整本地预检仍以 [代码质量与规范约束](./quality-gates.md) 为准。

## 已配置工作流

| 文件                                                                                                                                      | 触发                                                                                                                        | 作用                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`.github/workflows/ci.yml`](https://github.com/YanivWang/vue3-monorepo/blob/main/.github/workflows/ci.yml)                               | 任意 `pull_request`；`push` 到 `main`/`master`；亦可 `workflow_dispatch`                                                    | 单 job 跑 `pnpm run verify:full`（全量约 45s），并把 `coverage/` 作为 artifact 上传（保留 7 天）                                   |
| [`.github/workflows/docs-github-pages.yml`](https://github.com/YanivWang/vue3-monorepo/blob/main/.github/workflows/docs-github-pages.yml) | `push` 到 `main`/`master` 且路径含 `docs/**`、`pnpm-lock.yaml`、`package.json` 或本 workflow 文件；亦可 `workflow_dispatch` | 在 `docs` 目录执行 `pnpm run build`（带 `VITEPRESS_BASE` / `VITEPRESS_NO_GIT`），将 `docs/.vitepress/dist` 发布到 **GitHub Pages** |

| [`.github/workflows/docker-images.yml`](https://github.com/YanivWang/vue3-monorepo/blob/main/.github/workflows/docker-images.yml) | `push`/`pull_request` 且路径含 `docker/**`、`.dockerignore`、`.nvmrc`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`；亦可 `workflow_dispatch` | 用矩阵并行构建 admin / h5 / docs 三个生产镜像（只 build 不 push），带 GitHub Actions 构建缓存 |
| [`.github/dependabot.yml`](https://github.com/YanivWang/vue3-monorepo/blob/main/.github/dependabot.yml) | 每周一 09:00（Asia/Shanghai）扫 npm；每月扫 github-actions | 把依赖升级变成可 review 的 PR。catalog 锁得住版本漂移，锁不住「一直旧下去」；PR 会跑 `ci.yml` 的 `verify:full`。**major 也会开 PR，但单独分组**——只有 `@types/node`（须跟 Node 运行时大版本）与 `typescript`（被 typescript-eslint 的 peer 范围卡着）显式 ignore major |

### 为什么镜像构建要单独一条工作流

镜像里要完整 `pnpm install` 再构建三次，比 `verify:full` 慢一个量级，挂在每个 PR 上不划算；而它真正会坏的原因很集中——工具链版本、依赖、Dockerfile 本身——所以按 `paths` 触发。

这条工作流的由来是一次真实事故：`.nvmrc` 从 Node 20 抬到 22 后，三个 Dockerfile 仍是 `node:20-alpine` + `corepack prepare pnpm@10`，**三个镜像全部构建不出来**（corepack 以 `packageManager` 为准，钉子不生效；pnpm 11 在 Node 20 上直接 `ERR_UNKNOWN_BUILTIN_MODULE`），而当时 CI 只跑 `verify:full`，一路全绿。版本漂移那一半现在由 `pnpm run check:toolchain` 在 `verify:full` 里当场拦下，这条工作流负责剩下的那一半。

> GitHub Actions 的 workflow 解析器**不支持 YAML 锚点**（`&` / `*`），所以 `push` 与 `pull_request` 两处的 `paths` 是手抄的重复，改一处要记得同步另一处。

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

`verify:full` 全量约 45 秒（元数据检查 → 工具链一致性 → 依赖公告 → 主题产物 → 类型 → lint → 架构边界反例 → stylelint → prettier → 测试+覆盖率 → admin/h5/docs 三个构建）。拆成多 job 并行省下的墙钟时间，还不如各 job 各自 `pnpm install` 的开销，反而让「哪一步红了」要跨 job 找。等它涨到分钟级再拆。
