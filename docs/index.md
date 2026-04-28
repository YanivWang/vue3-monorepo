---
layout: home

hero:
  name: 'vue3-monorepo'
  text: '企业级 Monorepo 前端脚手架'
  tagline: 以 pnpm workspace 与共享包为核心；Admin（Element Plus）与 H5（Vant）双端同等重要，Vue3 + Vite + TypeScript，开箱即用的最佳实践集合
  actions:
    - theme: brand
      text: 新人上手
      link: /guide/onboarding
    - theme: alt
      text: 文档体系
      link: /guide/doc-system
    - theme: alt
      text: 环境命令
      link: /guide/getting-started
    - theme: alt
      text: 查看组件
      link: /components/page-container
    - theme: alt
      text: GitHub
      link: https://github.com/YanivWang/vue3-monorepo

features:
  - icon: 📦
    title: Monorepo 与工作区脚手架
    details: pnpm workspace 为核心：默认 Admin + H5 模板与文档站同仓，共享 @vue3-monorepo/shared；pnpm run create-app 复制 PC/H5 业务工程并接根脚本、tsconfig references、vitest.workspace.ts。双端同等重要，真实业务须在生成目录开发，勿在 pc-admin-template、h5-template 内写业务。

  - icon: ⚡
    title: Vite 5 极速构建
    details: 基于 Vite 5，开发服务器秒启，HMR 热更新，生产构建支持 Gzip/Brotli 双压缩与 Bundle 分析。

  - icon: 🔐
    title: 完整权限体系
    details: 支持后端菜单驱动的动态路由、按钮级 v-permission/v-role 指令、usePermission Composable，角色与权限码双模式。

  - icon: 🌙
    title: 主题与品牌色
    details: 共享包 Sass（root、brands、dark）与 JS API（applyThemeMode、applyBrand、getAppliedBrand 等）；PC 单独 dark.scss 对齐 Element Plus；H5 入口映射 Vant 变量。Pinia store 或 createUseTheme / createUseThemeH5；light/dark/system；PC 顶栏与登录页可调，未登录也可预览。

  - icon: 🌐
    title: 国际化
    details: 内置中英文切换，Element Plus 语言同步，vue-i18n 与 appStore 联动，支持运行时动态切换。

  - icon: 🛡️
    title: 全局异常处理
    details: 覆盖 Vue 组件错误、全局 JS 错误、未捕获 Promise，ErrorBoundary 组件提供降级 UI，可接入 Sentry。

  - icon: 🐳
    title: Docker 容器化
    details: docker/images/admin 多阶段构建（monorepo 根上下文），docker/nginx 含 SPA、Gzip、安全头；docker/docker-compose.yaml 本地验证。

  - icon: 🔄
    title: 请求取消与防重复
    details: HTTP 层集成 AbortController，cancelDuplicate 选项自动取消重复请求，适合搜索联想等高频场景。
---
