# @vue3-mono/shared

基础共享包 —— 类型 / 枚举 / 常量 / design tokens（`.scss` + `.ts` 双导出）

## 特性

- **不构建**：纯源码包，通过 `tsconfig.paths` 在仓库内直接引用 `src/`
- **SCSS 与 TS 双导出**：design tokens 同时提供 `*.scss`（编译期）和 `*.ts`（运行时 `useTheme` 读取）
- **零依赖**：不依赖任何业务运行时库

## 目录结构

```
src/
├── types/          # 两端共享 TS 类型
│   ├── api.ts          # ApiResponse / UserInfo / LoginParams / MenuRoute ...
│   ├── common.ts       # PaginationParams / SelectOption / TreeNode ...
│   └── index.ts
├── enums/          # 两端共享枚举
│   └── index.ts        # ThemeMode / Language / StorageKey / RequestCode / H5Host ...
├── constants/      # 两端共享常量
│   └── index.ts        # DEFAULT_PAGINATION / HTTP_STATUS / DEFAULT_SUCCESS_CODE ...
└── styles/
    ├── tokens.ts       # JS tokens + getCssVar / setCssVar（运行时主题）
    └── tokens/
        ├── index.scss      # 入口（variables + dark 聚合）
        ├── variables.scss  # :root + SCSS 变量（品牌色、尺寸、阴影）
        └── dark.scss       # html.dark 暗黑模式覆盖
```

## 使用

### TS / Vue

```ts
// 主入口：types + enums + constants + tokens 一次性导出
import type { UserInfo, PaginationResult } from '@vue3-mono/shared'
import { ThemeMode, StorageKey, tokens, setCssVar } from '@vue3-mono/shared'

// 子路径（按需）
import { H5Host } from '@vue3-mono/shared/enums'
import type { ApiResponse } from '@vue3-mono/shared/types'
import { DEFAULT_PAGINATION } from '@vue3-mono/shared/constants'
```

### SCSS

在应用的 `vite.config.ts` 中通过 `additionalData` 注入编译期变量：

```ts
css: {
  preprocessorOptions: {
    scss: {
      api: 'modern-compiler',
      additionalData: `@use "@vue3-mono/shared/styles/tokens/variables.scss" as *;`
    }
  }
}
```

或在全局 `main.scss` 中直接 `@use` 聚合入口：

```scss
@use '@vue3-mono/shared/styles/tokens/index.scss' as *;
```

## 构建

本包不构建，不发包。仓库内所有引用者通过 `tsconfig.paths` 指向 `src/` 源码。
