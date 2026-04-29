# vue3-monorepo

🚀 **企业级 Vue3 + Monorepo 多端工程化脚手架**
一套工程体系同时支撑 **PC 管理后台** 与 **H5 移动端**，内置双端模板、共享能力层与完整工程规范，实现多端复用、可观测、可部署的一站式前端研发方案。

## 🔗 项目地址

- 源码：https://github.com/YanivWang/vue3-monorepo
- 在线文档：https://yanivwang.github.io/vue3-monorepo/

## 🎯 核心亮点

- **Monorepo 多端架构**：基于 pnpm workspace 实现 PC/H5 同仓开发，公共逻辑抽离共享，避免重复造轮子
- **双端开箱模板**：内置 Element Plus PC 后台模板 + Vant H5 模板，支持 Bridge 跨端交互
- **完整工程规范**：ESLint/Stylelint/Prettier + Husky 提交门禁 + TS 类型校验，强制保障代码质量
- **一站式业务能力**：内置权限体系、主题/暗黑模式、多品牌 Design Token、i18n 国际化
- **全链路可观测**：双端具备全局错误捕获与可扩展上报；**Web Vitals 指标采集与上报**在 **H5 模板**中自带（`web-vitals` 插件），PC 侧以 `errorHandler` 为主，可按需自行接入同类指标
- **工程化脚手架**：`create-app` 命令一键生成业务应用，业务与模板彻底解耦
- **生产级部署**：提供 Docker + Nginx 容器化参考；文档站可由 GitHub Actions 发布至 GitHub Pages（应用侧 PR 级 CI 见 [ci-and-automation](docs/guide/ci-and-automation.md)）

## 🛠️ 技术栈

**核心框架**：Vue3 + TypeScript + Vite + Vue Router + Pinia
**UI 组件**：Element Plus (PC)、Vant (H5)
**工程化**：pnpm + Monorepo + ESLint + Prettier + Husky + Commitlint
**可视化**：ECharts、vue-echarts
**部署与自动化**：Docker + Nginx 参考方案；GitHub Actions 当前用于文档站发布（见 `.github/workflows/`）
**其他**：vue-i18n、Mock 数据、JSBridge（H5）、全局错误处理；**Web Vitals** 采集见 H5 模板（PC 未默认接入 `web-vitals` 依赖）

## 🎯 适用场景 & 解决痛点

- 面向需要同时开发 **PC 后台 + H5 移动端** 的团队/个人
- 解决多端项目重复开发、规范不统一、依赖混乱、部署链路割裂等企业级痛点
- 实现**一次搭建、多端复用**，新业务快速落地，长期维护成本更低

## 📦 环境要求

- Node.js ≥ 20.19.5
- pnpm ≥ 10.17.0（仅支持 pnpm，禁止混用 npm/yarn）

## 🚀 快速开始

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

# 全量代码校验（提交/发版前执行）
pnpm run verify:full
```

## ⚙️ 常用命令

| 功能                            | 命令                   |
| ------------------------------- | ---------------------- |
| 新建业务应用                    | pnpm run create-app    |
| TypeScript 类型检查             | pnpm run typecheck     |
| 单元测试                        | pnpm run test          |
| 项目构建                        | pnpm run build         |
| 全量校验（类型+Lint+测试+构建） | pnpm run verify:full   |
| 依赖清理重装                    | pnpm run clean:install |

## 📁 核心目录结构

```
vue3-monorepo/
├── apps/                 # 多端应用目录
│   ├── pc/               # PC 端应用（模板+业务项目）
│   └── h5/               # H5 端应用（模板+业务项目）
├── packages/shared/      # 公共共享包（多端复用业务与工程能力）
│   ├── src/
│   │   ├── bridge/           # JSBridge 抽象与多端策略（浏览器 / 微信小程序 / App 等）
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
├── .github/workflows/    # GitHub Actions（当前为文档站发布等，见文档「CI 与自动化」）
└── 工程配置文件           # ESLint/Prettier/TS/Monorepo 相关配置
```

## 📖 文档

架构、命令门禁、组件说明、部署与 CI 等均见 VitePress 文档站：[在线文档](https://yanivwang.github.io/vue3-monorepo/)（目录与分层说明见站内 [文档体系总览](docs/guide/doc-system.md)）。

## 📄 许可证

MIT License
