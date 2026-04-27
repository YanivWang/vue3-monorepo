# vue3-monorepo

企业级 Vue3 monorepo 模板：pnpm workspace、PC 管理端（Element Plus）、移动端 H5（Vant 4 + Bridge）、VitePress 文档站与共享包 `@vue3-monorepo/shared`。依赖版本以根目录 `package.json` 与 `pnpm-lock.yaml`（及 `pnpm-workspace.yaml` 中的 `catalog`）为准。

**在线文档站（企业级知识库、可搜索）**：[https://yanivwang.github.io/vue3-monorepo/](https://yanivwang.github.io/vue3-monorepo/)

**分工**：根 README 只做**入门索引与速查**；**完整说明、排障、环境变量、目录约定、CI、安全、性能等**均在文档站，与 [CONTRIBUTING.md](CONTRIBUTING.md) 及源码同步维护。本地 Markdown 源在 `docs/guide/` 等目录，不启动 `docs:dev` 也可在 IDE 中阅读。

| 你打算…… | 优先阅读 |
| --- | --- |
| 第一次 clone、装依赖、开 dev | [新人上手指南](docs/guide/onboarding.md) |
| 文档分几层、和 README 谁写什么 | [文档体系总览](docs/guide/doc-system.md) |
| `pnpm`、filter、新代码/依赖放哪 | [Monorepo 工作流](docs/guide/monorepo-workflow.md)、[项目与目录约定](docs/guide/project-conventions.md) |
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

Vue 3、Vite、TypeScript、Vue Router、Pinia；PC 为 Element Plus，H5 为 Vant 4 与 Bridge；请求封装在 `@vue3-monorepo/shared/request-*`。**带版本与模块说明**见文档站 [架构说明](docs/guide/architecture.md)。

## 仓库结构

```
vue3-monorepo/
├── apps/pc/pc-admin-template/   # PC 管理端，dev 默认 5173
├── apps/h5/h5-template/         # H5，dev 默认 5174
├── docs/                        # VitePress，dev 默认 5175
├── packages/shared/             # @vue3-monorepo/shared
├── scripts/                     # check-refs、check-request-core、docker 封装等
├── docker/                      # compose、各端 Dockerfile、nginx
├── pnpm-workspace.yaml
└── package.json
```

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
