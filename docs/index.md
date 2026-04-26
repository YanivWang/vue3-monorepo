---
layout: home

hero:
  name: 'vue3-monorepo-template'
  text: '企业级前端脚手架'
  tagline: Vue3 + Vite + TypeScript + Element Plus，开箱即用的最佳实践集合
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看组件
      link: /components/page-container
    - theme: alt
      text: GitHub
      link: https://github.com/your-org/vue3-monorepo-template

features:
  - icon: ⚡
    title: Vite 5 极速构建
    details: 基于 Vite 5，开发服务器秒启，HMR 热更新，生产构建支持 Gzip/Brotli 双压缩与 Bundle 分析。

  - icon: 🔐
    title: 完整权限体系
    details: 支持后端菜单驱动的动态路由、按钮级 v-permission/v-role 指令、usePermission Composable，角色与权限码双模式。

  - icon: 🌙
    title: 暗黑模式
    details: 基于 CSS 变量的完整暗黑主题，支持 light/dark/system 三种模式，Element Plus 深度集成，跟随系统自动切换。

  - icon: 🌐
    title: 国际化
    details: 内置中英文切换，Element Plus 语言同步，vue-i18n 与 appStore 联动，支持运行时动态切换。

  - icon: 🛡️
    title: 全局异常处理
    details: 覆盖 Vue 组件错误、全局 JS 错误、未捕获 Promise，ErrorBoundary 组件提供降级 UI，可接入 Sentry。

  - icon: 📊
    title: Web Vitals 监控
    details: 自动采集 CLS、INP、LCP、FCP、TTFB 核心性能指标，开发环境带评级输出，生产环境可接入自定义上报。

  - icon: 🐳
    title: Docker 容器化
    details: docker/images/admin 多阶段构建（monorepo 根上下文），docker/nginx 含 SPA、Gzip、安全头；docker/docker-compose.yaml 本地验证。

  - icon: 🔄
    title: 请求取消与防重复
    details: HTTP 层集成 AbortController，cancelDuplicate 选项自动取消重复请求，适合搜索联想等高频场景。
---
