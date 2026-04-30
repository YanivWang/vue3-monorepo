---
layout: home

hero:
  name: 'vue3-monorepo'
  text: 'Monorepo 前端脚手架'
  tagline: pnpm workspace 与共享包；Admin（Element Plus）与 H5（Vant）双模板；Vue3 · Vite · TypeScript
  actions:
    - theme: brand
      text: 新手上路
      link: /guide/onboarding
    - theme: alt
      text: 架构
      link: /guide/architecture
    - theme: alt
      text: GitHub
      link: https://github.com/YanivWang/vue3-monorepo

features:
  - icon: ✅
    title: Monorepo 现代化工程管理方案
    link: /guide/monorepo-introduce
    details: Monorepo 是一种现代化工程管理方案。它的优势是实现了规范的统一化管理、代码的统一化管理、方便的代码共享。

  - icon: ✅
    title: 代码质量与规范约束
    link: /guide/quality-gates
    details: 环境版本锁定、TypeScript、Prettier、ESLint、StyleLint、Git 提交校验（commitlint、husky、lint-staged）。

  - icon: 🔐
    title: 权限体系
    link: /guide/permission
    details: 菜单驱动动态路由、路由守卫与指令/组合式 API，角色与权限码双模式。

  - icon: 🌙
    title: 主题与品牌切换
    link: /guide/theme
    details: 多主题与明暗切换，Design Token 与 CSS 变量驱动，支持多品牌皮肤。

  - icon: 🌐
    title: i18n 国际化
    link: /guide/i18n
    details: 语言包懒加载（shared + 各端动态 import）；Vue I18n 与 Element Plus / Vant 语言联动，store 持久化。

  - icon: 📡
    title: HTTP 请求控制，数据 Mock
    link: /guide/http-and-mock
    details: 统一请求封装与 Mock 联调；请求取消、去重与竞态治理；PC / H5 分层复用。

  - icon: 🛡️
    title: 全局错误监控
    link: /guide/errors-and-observability
    details: 异常与 Promise 分层处理，插件化上报，便于对接自建观测与多端统一策略。

  - icon: 📈
    title: 全局性能监控
    link: /guide/web-vitals
    details: Web Vitals（Core Web Vitals）等指标采集，环境变量配置上报 URL；H5 模板独立插件接入，可与错误观测共用版本号与采集链路。

  - icon: 📱
    title: H5 Bridge 与 WebView
    link: https://github.com/YanivWang/vue3-monorepo/blob/main/apps/h5/h5-template/docs/bridge-protocol.md
    details: 与宿主 App 的 JSBridge 约定与典型 WebView 场景，细节见仓库协议文档。

  - icon: ➕
    title: 脚手架一键新增业务应用
    link: /guide/adding-a-new-app
    details: 从 PC / H5 模板一键生成业务应用，对齐 workspace、脚本与测试等 monorepo 约定。

  - icon: 🚀
    title: 部署与 Docker
    link: /guide/deploy
    details: 静态发布流程与多阶段镜像、Nginx SPA 等生产级部署参考。

  - icon: 🔭
    title: Vite 构建优化
    link: /guide/performance
    details: Vite 分包、分析与首屏优化；Core Web Vitals 与客户端错误由 **`@vue3-monorepo/web-monitor`** 在各应用 `main.ts` 接入，与 [全局性能监控](/guide/web-vitals)、[全局错误监控](/guide/errors-and-observability) 衔接。
---
