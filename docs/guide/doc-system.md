# 文档体系总览

本文说明本仓库**文档资产如何组织**、**各层文档写什么**、以及**给新手的一条完整学习路径**。读完这一页，你就知道「该读哪、去哪改、和 README 怎么分工」。

## 1. 为什么需要「文档体系」

**叙事核心**：**Monorepo（pnpm workspace）** 统管多包与共享层；**PC Admin 与 H5** 在工程上**并列**，文档分专页展开时不代表某一端次要。

| 问题                                      | 文档体系的作法                                                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| README 只有一页，长文影响「一眼看清仓库」 | 根 README 保持**速查**；细节放到 **VitePress 文档站**（本 `docs/` 包）                                                  |
| 新人不知道先装啥、后点啥                  | 提供 **[新手上路](./onboarding.md)** 与**推荐阅读顺序**（见下）                                                         |
| 架构、权限、部署分散在口头约定            | 指南类 Markdown **唯一权威**在 `docs/guide/`，与代码变更同步（见 `CONTRIBUTING.md`）                                    |
| 业务组件没有用法说明                      | **组件专页**在 `docs/components/`，与模板中已文档化的共享/业务组件**同步维护**（并非 `exports` 中每一子路径都有对应页） |

> **一句话**：GitHub 上的 README 负责「进门」；VitePress 是**与常见企业级文档站品类对齐的完整知识库**（可搜索、可部署），负责「**住下来干活、排障、合流**」的展开叙述。

## 2. 全站信息架构与读者路径

| 读者          | 建议入口                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 新同学        | [新手上路](./onboarding.md) → [环境与命令速查](./getting-started.md) → 侧栏「入门与工程化」                                  |
| 日常开发      | [项目与目录约定](./project-conventions.md)、[代码质量与规范约束](./quality-gates.md)、[排障与 FAQ](./troubleshooting.md)     |
| 做需求/看架构 | 侧栏「应用架构与工程实践」→ [架构说明](./architecture.md) 等                                                                 |
| 发版/CI/部署  | [CI 与自动化](./ci-and-automation.md)、[部署与 Docker](./deploy.md)、[分支策略](./branch-strategy.md)                        |
| 提 PR         | 根 [CONTRIBUTING.md](https://github.com/YanivWang/vue3-monorepo/blob/main/CONTRIBUTING.md) + [贡献与协作](./contributing.md) |

## 3. 文档资产全景（本仓库里都有啥）

| 资产               | 路径 / 位置                                                   | 用途                                                                      | 典型读者               |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------- |
| **根 README**      | 仓库根 `README.md`                                            | 一句话介绍、**环境/结构/快链/脚本摘录**；长表与长文不放在此               | 所有人；Clone 后第一眼 |
| **VitePress 站点** | `docs/` 包                                                    | 可搜索、多页、可部署的**主文档（企业级展开层）**                          | 开发、接需求、查组件   |
| **贡献与协作**     | 根 `CONTRIBUTING.md`                                          | 分支、Commit、PR、规范与**文档维护义务**                                  | 要提 PR 的人           |
| **H5 宿主协议**    | `apps/h5/h5-template/docs/bridge-protocol.md`                 | 与 App WebView/JSBridge 的**协议级**说明                                  | 做 H5 与客户端联调     |
| **各应用内注释**   | `apps/*`、`packages/shared` 源码                              | 实现细节、与单行逻辑绑定                                                  | 改具体文件时           |
| **配置即文档**     | `packages/shared/package.json` 的 `exports`                   | **子路径怎么 import**，以 `exports` 为唯一真源                            | 从 shared 引用时必查   |
| **锁与版本**       | `pnpm-lock.yaml`、`pnpm-workspace.yaml` 的 `catalog`          | 依赖版本真相来源                                                          | 升级依赖、排障         |
| **Workspace 库**   | `packages/request-core`、`web-monitor`、`js-bridge`、`shared` | HTTP 内核、可观测、Bridge、跨端复用；边界见 [架构说明](./architecture.md) | 改基建或共享导出时     |
| **Docker**         | `docker/*`、`scripts/docker.sh`                               | 与 [部署与 Docker](./deploy.md) 及仓库内 compose/nginx 配套               | 联调/预发镜像          |

**边界约定**（单源、少双改）：

- **只写一次、写详细**：排障、环境变量、Monorepo、质量门禁、HTTP/Mock、安全、性能、CI 等 → 以 **本站点** 对页为准（见侧栏三栏分组）。
- **根 README 保持短**：用表格/链接指到上列专页；**版本号、脚本名** 仍以根 `package.json` 为同步真源，README 可保留**摘录表**作索引。

## 4. 推荐阅读顺序（学习路径）

### 第 0 步：5 分钟（在 GitHub 上就能完成）

1. 克隆后读仓库根 **`README.md`** 的「环境要求」（与根 `package.json` 的 `engines` 一致），装好 Node / pnpm。
2. 扫一眼 **`README.md`** 中「核心目录结构」「常用命令」；展开的命令手册见本站 [环境与命令速查](./getting-started.md)，门禁与 `verify:full` 细节见 [代码质量与规范约束](./quality-gates.md)。

### 第 1 步：本地把文档站跑起来（10 分钟）

```bash
pnpm install
pnpm run docs:dev
```

浏览器打开终端提示的地址（**默认 `http://127.0.0.1:5175`**），侧边栏从 **[新手上路](./onboarding.md)** 开始看。

> 不启动文档站也可以：在仓库里直接打开 `docs/guide/*.md` 阅读，效果一致，仅无搜索与导航。

### 第 2 步：按角色选读（可并行）

**定位**：**Monorepo（pnpm workspace）** 是协作枢纽；**PC Admin（Element Plus）与 H5（Vant）** 为两条**同等重要**的应用线——下表按「你要做什么」拆分，**无主次顺序**；某篇以 Admin 为主写实现细节时，仅因后台能力（动态路由、权限等）文档化较深，**不表示 H5 次要**。

| 角色 / 目标                                  | 建议阅读顺序                                                                                                                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **完全没接触过 monorepo 的新人**             | [新手上路](./onboarding.md) → [环境与命令速查](./getting-started.md) → [Monorepo 现代化工程管理方案](./monorepo-introduce.md) → [pnpm workspace 日常操作](./monorepo-workflow.md) |
| **要写 PC Admin 业务页面**                   | [架构说明](./architecture.md)（正文以 Admin 模板展开）→ [权限体系](./permission.md) → 侧栏 **组件** 里相关页面（如 `PageContainer`、`ProTable`）                                  |
| **要写 H5 业务页面**                         | [项目与目录约定](./project-conventions.md) → [架构说明](./architecture.md) 中与 H5 并列的仓库视图；与原生联调时对照应用内 `bridge-protocol.md`                                    |
| **要改公共能力（请求、hooks、shared 组件）** | [pnpm workspace 日常操作](./monorepo-workflow.md) 中 **shared 与 exports** 一节 → 直接读 `packages/shared/package.json#exports`                                                   |
| **要新增 PC Admin 或 H5 业务应用**           | 根 `pnpm run create-app`（勿在 `*-template` 写业务）；说明见 [脚手架一键新增业务应用](./adding-a-new-app.md)                                                                      |
| **要发版/过流水线**                          | [代码质量与规范约束](./quality-gates.md) / [CI 与自动化](./ci-and-automation.md)                                                                                                  |
| **要部署/容器**                              | [部署与 Docker](./deploy.md)（与 `docker/`、`scripts/docker.sh` 一致）                                                                                                            |

### 第 3 步：和团队规范对齐

- 分支与 PR、Conventional Commits：根 [CONTRIBUTING.md](https://github.com/YanivWang/vue3-monorepo/blob/main/CONTRIBUTING.md) 与 [贡献与协作](./contributing.md)。

## 5. 技术选型：文档站用啥写的

| 层       | 技术                                | 说明                                                                                                  |
| -------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 站点框架 | [VitePress](https://vitepress.dev/) | 版本见 `pnpm-workspace.yaml` 的 `catalog.vitepress`（如 `^1.6.4`）；Markdown 驱动，本仓库中文默认语言 |
| 包管理   | 与根工程一致，**仅 pnpm**           | `docs` 是 workspace 一包：`@vue3-monorepo/docs`                                                       |
| 本地开发 | `pnpm run docs:dev`                 | 见根 `package.json` 的 `docs:dev`                                                                     |
| 生产构建 | `pnpm run docs:build`               | 产物在 `docs/.vitepress/dist`；部署见 [部署与 Docker](./deploy.md)                                    |

## 6. 目录与内容地图（`docs/` 里有什么）

侧栏为最新列表：顶部导航「组件」对应 **`docs/components/`**（共享组件用法）；`guide/` 下**按主题**还包含各专页，例如 `troubleshooting`、`environment-variables`、`project-conventions`、`ci-and-automation`、`i18n`、`http-and-mock`、`security` 等（与侧栏**入门与工程化** / **应用架构与工程实践** / **发布、CI 与分支** 三组对应）。

**维护规则（企业级项目建议写进团队 Wiki 的一条）**：

- 改 **可复用组件/对外 API** → 同时改 `docs/components/` 或 `docs/guide/` 中对应节。
- 只改**内部实现、行为不变** → 不必动文档；行为变更则必须更文档或发版说明。

## 7. 和「根 README」的交叉索引

根 README 仅保留**摘录与链接**；下列主题以**文档站**为展开层：

| 需求                                   | 文档站                                                              |
| -------------------------------------- | ------------------------------------------------------------------- |
| 排障、安装异常                         | [排障与 FAQ](./troubleshooting.md)                                  |
| 环境变量                               | [环境变量](./environment-variables.md)                              |
| 新功能/目录放哪                        | [项目与目录约定](./project-conventions.md)                          |
| 脚本、verify、质量                     | [代码质量与规范约束](./quality-gates.md)                            |
| 架构、请求、i18n、安全、性能、可观测性 | 侧栏「应用架构与工程实践」下各页                                    |
| Docker、发版、CI                       | [部署与 Docker](./deploy.md)、[CI 与自动化](./ci-and-automation.md) |
| 贡献、提交、PR                         | [贡献与协作](./contributing.md) + 根 `CONTRIBUTING.md`              |

## 8. 常见问题

**Q：我只 clone 了仓库，不跑 `docs:dev` 能上手吗？**  
可以。按 [新手上路](./onboarding.md) 在本地起 `admin` / `h5` 即可；文档用 IDE 读 `docs/guide` 下 Markdown 也行。

**Q：组件文档和 Storybook 类工具有啥区别？**  
当前以 **VitePress 静态站** 为主，便于和版本库、Docker、内网部署一致管理；若团队后续加 Storybook，可并列存在，VitePress 仍适合「叙述性」架构与流程文档。

**Q：本页（`doc-system`）和《环境与命令速查》谁先看？**  
想理解「**整个仓库怎么学**」→ 先看本页；想「**敲哪些命令**」→ [新手上路](./onboarding.md) 与 [环境与命令速查](./getting-started.md)。

---

_若本页链接失效或命令与根 `package.json` 不一致，以仓库**最新**根 `package.json` 与 `docs/package.json` 为准，并欢迎按 `CONTRIBUTING.md` 提 PR 修正文档。_
