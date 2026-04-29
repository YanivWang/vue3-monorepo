---
layout: home

hero:
  name: 'vue3-monorepo'
  text: 'Monorepo 前端脚手架'
  tagline: pnpm workspace 与共享包；Admin（Element Plus）与 H5（Vant）双模板；Vue3 · Vite · TypeScript
  actions:
    - theme: brand
      text: 组件
      link: /components/page-container
    - theme: alt
      text: 性能
      link: /guide/performance
    - theme: alt
      text: GitHub
      link: https://github.com/YanivWang/vue3-monorepo

features:
  - icon: ✅
    title: 质量门禁
    link: /guide/quality-gates
    details: 版本锁定与类型检查，格式化与 Lint，提交规范与钩子一站配置。

  - icon: 🔐
    title: 权限体系
    link: /guide/permission
    details: 菜单驱动动态路由、路由守卫与指令/组合式 API，角色与权限码双模式。

  - icon: 🌙
    title: 主题与品牌
    link: /guide/theme
    details: 多主题与明暗切换，Design Token 与 CSS 变量驱动，支持多品牌皮肤。

  - icon: 🌐
    title: 国际化
    link: /guide/i18n
    details: 语言包懒加载，与组件库语言联动，适合后台与 C 端活动等多语言场景。

  - icon: 📡
    title: HTTP、Mock 与请求控制
    link: /guide/http-and-mock
    details: 统一请求封装与 Mock 联调；取消、去重与竞态治理；PC / H5 分层复用。

  - icon: 🛡️
    title: 全局错误监控
    link: /guide/errors-and-observability
    details: 异常与 Promise 分层处理，插件化上报，便于对接自建观测与多端统一策略。

  - icon: 🛡️
    title: 全局性能监控
    link: /guide/errors-and-observability
    details: 异常与 Promise 分层处理，插件化上报，便于对接自建观测与多端统一策略。

  - icon: 📱
    title: H5 Bridge 与 WebView
    link: https://github.com/YanivWang/vue3-monorepo/blob/main/apps/h5/h5-template/docs/bridge-protocol.md
    details: 与宿主 App 的 JSBridge 约定与典型 WebView 场景，细节见仓库协议文档。

  - icon: ➕
    title: 脚手架新增业务应用
    link: /guide/adding-a-new-app
    details: 从 PC / H5 模板一键生成业务应用，对齐 workspace、脚本与测试等 monorepo 约定。

  - icon: 🚀
    title: 部署与 Docker
    link: /guide/deploy
    details: 静态发布流程与多阶段镜像、Nginx SPA 等生产级部署参考。

  - icon: 🔭
    title: Vite 构建优化
    link: /guide/performance
    details: Vite 分包、分析与首屏优化；线上可采集体验指标，与错误可观测衔接。
---
