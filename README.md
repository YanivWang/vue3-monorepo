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
- **全链路可观测**：全局错误捕获 + Web Vitals 性能监控，快速定位线上问题
- **工程化脚手架**：`create-app` 命令一键生成业务应用，业务与模板彻底解耦
- **生产级部署**：提供 Docker + Nginx 容器化部署方案，支持 CI/CD 自动化构建
- **规范文档体系**：配套 VitePress 完整文档，包含架构说明、上手指南、排障手册

## 🛠️ 技术栈

**核心框架**：Vue3 + TypeScript + Vite + Vue Router + Pinia
**UI 组件**：Element Plus (PC)、Vant (H5)
**工程化**：pnpm + Monorepo + ESLint + Prettier + Husky + Commitlint
**可视化**：ECharts、vue-echarts
**部署方案**：Docker + Nginx + GitHub Actions CI
**其他**：vue-i18n、Mock 数据、JSBridge、全局错误/性能监控

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
├── packages/shared/      # 公共共享包（请求、hooks、工具、样式 Token）
├── docs/                 # VitePress 项目文档
├── scripts/              # 工程化脚本（create-app、校验脚本）
├── docker/               # Docker 部署配置
├── .github/workflows/    # CI/CD 自动化流程
└── 工程配置文件           # ESLint/Prettier/TS/Monorepo 相关配置
```

## 📖 完整文档

- 新人上手指南、环境&命令速查
- Monorepo 工作流、目录规范
- 代码质量门禁、排障 FAQ
- 部署方案、CI 自动化配置

完整架构与使用说明详见：[在线文档站](https://yanivwang.github.io/vue3-monorepo/)

## 📄 许可证

MIT License
