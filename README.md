# vue3-monorepo

<div align="center">

🚀 **企业级 Vue3 + Monorepo 多端工程化脚手架**

一套工程体系同时支撑 **PC 管理后台** 与 **H5 移动端**，内置双端模板、共享能力层与完整工程规范，实现多端复用、可观测、可部署的一站式前端研发方案。

[![MIT License](https://img.shields.io/github/license/YanivWang/vue3-monorepo?label=License&color=blue)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![pnpm workspace](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/workspaces)

[**源码仓库**](https://github.com/YanivWang/vue3-monorepo) · [**在线文档**](https://yanivwang.github.io/vue3-monorepo/)

<br />

</div>

---

## 核心亮点

| 维度                      | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo 多端架构**     | 基于 pnpm workspace 的 PC/H5 同仓开发，公共逻辑下沉共享，减少重复实现                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **pnpm catalog 依赖治理** | 在 `pnpm-workspace.yaml` 中集中维护 **catalog**，各包以 `catalog:` 引用版本，统一升级、降低多包版本漂移（安装结果以 `pnpm-lock.yaml` 为准）                                                                                                                                                                                                                                                                                                                                                                                             |
| **双端开箱模板**          | Element Plus 后台 + Vant 移动端模板，内置 Bridge 跨端交互能力                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Bridge 协议专档**       | H5 宿主（如 App WebView）联调必备：[bridge-protocol.md](apps/h5/h5-template/docs/bridge-protocol.md)，与 `packages/shared` 中 **js-bridge** 抽象一致                                                                                                                                                                                                                                                                                                                                                                                    |
| **工程规范**              | ESLint / Stylelint / Prettier + Husky + **lint-staged** + **Commitlint** + TS 类型校验，提交与暂存区双重约束                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **测试与全量门禁**        | 根仓库 **Vitest** 单测（支持 coverage）；`pnpm run verify:full` 串联引用检查、`request-core` 检查、类型、Lint、样式、Prettier、测试与 **admin / h5 / docs** 构建                                                                                                                                                                                                                                                                                                                                                                        |
| **业务能力**              | **权限**：后端菜单生成动态路由；`meta` 权限/角色 + `v-permission`、`v-role`、`usePermission` 管控页级与按钮级展示。[权限体系](docs/guide/permission.md)<br>**主题**：多品牌主色与浅/深/**跟随系统**；`packages/shared` 侧 Token（`data-brand`、`html.dark`）+ `createUseTheme`，双端对接 Element Plus / Vant。[主题说明](docs/guide/theme.md)<br>**i18n**：Vue I18n，共享与业务词条分层，`shared/locale` 按需加载；语言切换同步组件库语言包。[i18n](docs/guide/i18n.md)<br>PC / H5 模板已贯通上述能力，可按业务在应用与 shared 内扩展。 |
| **数据可视化**            | 内置 **ECharts**、**vue-echarts**，与 PC 模板能力配套                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **可观测**                | 双端 `collectWebVitals` + `setupClientErrorReporting`（`packages/shared/web-monitor`）；环境变量 `VITE_WEB_VITALS_*` / `VITE_ERROR_REPORT_*` 与 H5 一致；PC 可选 `setErrorReporter` 附加消费                                                                                                                                                                                                                                                                                                                                            |
| **脚手架**                | `create-app` 一键生成业务应用，业务与模板解耦                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **文档体系**              | 内置 **VitePress** 文档站（可搜索、可部署），与根 README 分工；详情见下方 [文档](#文档) 与站内 [文档体系总览](docs/guide/doc-system.md)                                                                                                                                                                                                                                                                                                                                                                                                 |
| **部署与 CI**             | Docker + Nginx 参考（含 admin / h5 / docs 等 compose 入口）；文档站可由 GitHub Actions 发布至 GitHub Pages；应用侧 CI 见 [ci-and-automation](docs/guide/ci-and-automation.md)                                                                                                                                                                                                                                                                                                                                                           |

## 技术栈

| 类别             | 技术                                                                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 核心框架         | Vue 3、TypeScript、Vite、Vue Router、Pinia                                                                                                                                                |
| UI               | Element Plus（PC）、Vant（H5）                                                                                                                                                            |
| 工程化           | pnpm、Monorepo、**workspace catalog**、ESLint、Prettier、Husky、Commitlint                                                                                                                |
| 可视化           | ECharts、vue-echarts                                                                                                                                                                      |
| 错误与性能可观测 | 双端 **web-vitals**（Core Web Vitals）与 **`setupClientErrorReporting`**，实现见 `packages/shared/web-monitor`；`VITE_WEB_VITALS_*` / `VITE_ERROR_REPORT_*` 与 ingest 接入方式 PC/H5 一致 |
| 部署与自动化     | Docker、Nginx（参考）；GitHub Actions（见 `.github/workflows/`）                                                                                                                          |
| 其他             | vue-i18n、Mock、JSBridge（H5）；细节与排障见文档 [全局错误与可观测](docs/guide/errors-and-observability.md)、[Web Vitals](docs/guide/web-vitals.md)                                       |

## 适用场景与 Monorepo 收益

**谁适合用**

- 需要同时交付 **PC 后台** 与 **H5 移动端** 的团队或个人
- 希望减少多端重复开发、统一规范与依赖、缩短从开发到部署的协作链路

**Monorepo 能带来什么**

- **一次搭建、多端复用**：新业务快速落地，长期维护成本更低
- **共享层原子演进**：`packages/shared` 一处修改，PC/H5 同步受益；类型、常量、请求与安全策略可在同一 PR 内联动，减少「先发包再等各端升级」
- **依赖与工具链统一**：pnpm workspace 约束版本；ESLint、TSConfig、脚本与文档同仓，规范升级一次落地
- **质量门禁集中**：全量类型检查、Lint、测试与构建可在单仓编排，跨包重构影响一次性可见
- **协作闭环**：分支、PR、Issue 在同一仓库，Review 上下文完整，弱化多仓对齐 tag / cherry-pick / 发版节奏的成本
- **扩展友好**：新业务以 `apps/*` 接入，复用 `shared` 与既有脚手架，避免复制整仓或再维护一组相同底座

## 环境要求

| 依赖    | 版本                                              |
| ------- | ------------------------------------------------- |
| Node.js | ≥ 20.19.5                                         |
| pnpm    | ≥ 10.17.0（**仅支持 pnpm**，请勿混用 npm / yarn） |

## 快速开始

```bash
# 克隆项目
git clone https://github.com/YanivWang/vue3-monorepo.git
cd vue3-monorepo

# 安装依赖
pnpm install

# 启动项目
pnpm run admin:dev   # PC 管理端（端口 5173）
pnpm run h5:dev      # H5 移动端（端口 5174）
pnpm run docs:dev    # 在线文档（端口 5175）

# 全量代码校验（提交 / 发版前建议执行）
pnpm run verify:full
```

## 常用命令

| 功能                                  | 命令                     |
| ------------------------------------- | ------------------------ |
| 新建业务应用                          | `pnpm run create-app`    |
| TypeScript 类型检查                   | `pnpm run typecheck`     |
| 单元测试                              | `pnpm run test`          |
| 项目构建                              | `pnpm run build`         |
| 全量校验（类型 + Lint + 测试 + 构建） | `pnpm run verify:full`   |
| 依赖清理重装                          | `pnpm run clean:install` |

## 核心目录结构

```
vue3-monorepo/
├── apps/                 # 多端应用目录
│   ├── pc/               # PC 端应用（模板 + 业务项目）
│   └── h5/               # H5 端应用（模板 + 业务项目）
├── packages/shared/      # 公共共享包（多端复用业务与工程能力）
│   ├── src/
│   │   ├── js-bridge/        # JSBridge 抽象与多端策略（浏览器 / 微信小程序 / App 等）
│   │   ├── web-monitor/      # Web Vitals 与客户端错误上报（PC/H5 共用实现）
│   │   ├── components-pc/    # PC 共享组件（如 ProTable、PageContainer、ErrorBoundary）
│   │   ├── components-h5/    # H5 共享组件（如 NavBar、ProList、SafeArea、TabBarLayout）
│   │   ├── directives-pc/    # PC 指令（权限、复制等）
│   │   ├── directives-h5/    # H5 指令（权限、长按、lazy 等）
│   │   ├── hooks-core/       # 跨端 hooks（权限、请求、分页、主题、历史栈等）
│   │   ├── hooks-pc/         # PC 专用 hooks（消息、图表等）
│   │   ├── hooks-h5/         # H5 专用 hooks（登录、主题、VConsole、列表筛选等）
│   │   ├── locale/           # vue-i18n 配置与中英文文案
│   │   ├── request-core/     # HTTP 客户端核心与通用类型
│   │   ├── request-pc/       # PC 端请求封装与 loading/preset
│   │   ├── request-h5/       # H5 端请求封装与 loading/preset
│   │   ├── styles/           # 全局样式与 Design Token（含多品牌、暗黑）
│   │   ├── types/            # 公共 TS 类型
│   │   ├── utils/            # 工具函数（校验、存储、echarts、脱敏等）
│   │   ├── constants/        # 常量
│   │   └── enums/            # 枚举
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── docs/                 # VitePress 项目文档
├── scripts/              # 工程化脚本（create-app、校验脚本）
├── docker/               # Docker 部署配置
├── .github/workflows/    # GitHub Actions（文档站发布等，见文档「CI 与自动化」）
└── 工程配置文件           # ESLint / Prettier / TS / Monorepo 相关配置
```

## 文档

架构、命令门禁、组件说明、部署与 CI 等见 VitePress [**在线文档**](https://yanivwang.github.io/vue3-monorepo/)；目录与分层见站内 [文档体系总览](docs/guide/doc-system.md)。

## 许可证

[MIT](./LICENSE)
