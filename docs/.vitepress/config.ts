import { defineConfig } from 'vitepress'

/** Docker / 无 .git 上下文构建时置 1，避免 VitePress 调用 git 取 lastUpdated */
const vitePressNoGit = process.env.VITEPRESS_NO_GIT === '1'

/**
 * GitHub Pages 项目站 URL 为 https://用户名.github.io/仓库名/ 时，构建前设置
 * VITEPRESS_BASE=/仓库名/（前后都要有斜杠）。若仓库为 用户名.github.io 根站，不设置，保持 `/`。
 */
const vitePressBase = process.env.VITEPRESS_BASE || '/'

export default defineConfig({
  title: 'vue3-monorepo',
  description: '企业级 Vue3 + Vite + TypeScript 脚手架模板文档',
  lang: 'zh-CN',
  base: vitePressBase,

  /** 与 admin(5173)、h5(5174) 错开，便于 `pnpm dev` 三端同启（走 Vite 的 server 配置） */
  vite: {
    server: {
      port: 5175
    }
  },

  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'vue3-monorepo',

    nav: [
      { text: '文档体系', link: '/guide/doc-system' },
      { text: '新手上路', link: '/guide/onboarding' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/components/page-container' },
      { text: '架构', link: '/guide/architecture' },
      { text: '贡献', link: '/guide/contributing' },
      {
        text: '更新日志',
        link: 'https://github.com/YanivWang/vue3-monorepo/blob/main/CHANGELOG.md'
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门与工程化',
          items: [
            { text: '文档体系总览', link: '/guide/doc-system' },
            { text: '新人上手指南', link: '/guide/onboarding' },
            { text: '环境与命令速查', link: '/guide/getting-started' },
            { text: 'Monorepo 工作流', link: '/guide/monorepo-workflow' },
            { text: '新增 H5 / Admin 应用', link: '/guide/adding-a-new-app' },
            { text: '质量门禁与脚本', link: '/guide/quality-gates' },
            { text: '项目与目录约定', link: '/guide/project-conventions' },
            { text: '排障与 FAQ', link: '/guide/troubleshooting' },
            { text: '环境变量', link: '/guide/environment-variables' },
            { text: '贡献与协作', link: '/guide/contributing' }
          ]
        },
        {
          text: '应用架构与工程实践',
          items: [
            { text: '架构说明', link: '/guide/architecture' },
            { text: '权限体系', link: '/guide/permission' },
            { text: '主题、暗黑与品牌色', link: '/guide/theme' },
            { text: 'Design Token', link: '/guide/design-tokens' },
            { text: '国际化', link: '/guide/i18n' },
            { text: 'HTTP 与 Mock', link: '/guide/http-and-mock' },
            { text: '错误与可观测性', link: '/guide/errors-and-observability' },
            { text: '性能与构建', link: '/guide/performance' },
            { text: '安全', link: '/guide/security' },
            { text: '无障碍与可用性', link: '/guide/accessibility' }
          ]
        },
        {
          text: '发布、CI 与分支',
          items: [
            { text: '分支策略', link: '/guide/branch-strategy' },
            { text: '部署', link: '/guide/deploy' },
            { text: 'CI 与自动化', link: '/guide/ci-and-automation' }
          ]
        }
      ],
      '/components/': [
        {
          text: '业务组件',
          items: [
            { text: 'PageContainer 页面容器', link: '/components/page-container' },
            { text: 'ProTable 高级表格', link: '/components/pro-table' },
            { text: 'Skeleton 骨架屏', link: '/components/skeleton' },
            { text: 'SvgIcon 图标', link: '/components/svg-icon' },
            { text: 'ErrorBoundary 错误边界', link: '/components/error-boundary' }
          ]
        }
      ]
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/YanivWang/vue3-monorepo' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024'
    },

    search: { provider: 'local' },

    editLink: {
      pattern: 'https://github.com/YanivWang/vue3-monorepo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    ...(vitePressNoGit ? {} : { lastUpdated: { text: '最后更新' } }),

    outline: { label: '本页目录', level: [2, 3] },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  },

  markdown: {
    lineNumbers: true
  }
})
