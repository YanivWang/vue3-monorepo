# @vue3-mono/components-h5

H5 端共享业务组件（Vant 4 生态）

## 约定

- **显式 import**：本包任何 Vant 组件的 `.vue` 必须显式 `import { Button, List } from 'vant'`
- **peer 为准**：`vue` / `vant` / `@vueuse/core` 全部 peer，构建外部化
- **Vite lib 模式**：`rollupOptions.external` 含 `vue / vant / @vueuse/core / /^@vue3-mono\//`
- **消费方配合**：apps/h5 的 `vite.config.ts` 需加 `optimizeDeps.include: ['vant/es/*/style']` 或 `ssr.noExternal: [/vant/]` 避免按需样式丢失

## 构建

`vite build`（lib 模式，ESM only）
