import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vue3 Vite Template',
  description: '企业级 Vue3 + Vite + TypeScript 脚手架模板文档',
  lang: 'zh-CN',
  base: '/',

  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Vue3 Template',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/components/page-container' },
      { text: '架构', link: '/guide/architecture' },
      {
        text: '更新日志',
        link: 'https://github.com/your-org/vue3-vite-template/blob/main/CHANGELOG.md'
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '快速上手',
          items: [
            { text: '介绍', link: '/guide/getting-started' },
            { text: '架构说明', link: '/guide/architecture' },
            { text: '权限体系', link: '/guide/permission' },
            { text: '主题与暗黑模式', link: '/guide/theme' },
            { text: 'Design Token', link: '/guide/design-tokens' },
            { text: '分支策略', link: '/guide/branch-strategy' },
            { text: '部署', link: '/guide/deploy' }
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

    socialLinks: [{ icon: 'github', link: 'https://github.com/your-org/vue3-vite-template' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024'
    },

    search: { provider: 'local' },

    editLink: {
      pattern: 'https://github.com/your-org/vue3-vite-template/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: { text: '最后更新' },

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
