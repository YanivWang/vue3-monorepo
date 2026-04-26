# 快速上手

## 环境要求

| 工具    | 版本要求 |
| ------- | -------- |
| Node.js | >= 20.x  |
| pnpm    | >= 10.x  |
| Git     | >= 2.x   |

## 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/vue3-monorepo-template.git
cd vue3-monorepo-template

# 安装依赖
pnpm install
```

## 本地开发

```bash
# 启动开发服务器（默认 http://localhost:5173）
pnpm dev
```

> 开发环境默认开启 Mock（`VITE_USE_MOCK=true`），无需后端即可运行。

## 构建

```bash
# 生产构建
pnpm build

# 预览构建产物
pnpm preview

# 开发模式构建（用于测试环境）
pnpm build:dev

# 打包体积分析
VITE_ANALYZE=true pnpm build
```

## 代码规范

```bash
# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix

# Stylelint 检查
pnpm lint:style

# Prettier 格式化
pnpm format
```

## 单元测试

```bash
# 交互式测试（watch 模式）
pnpm test

# 单次运行
pnpm test:run

# 覆盖率报告
pnpm test:coverage
```

## Docker 部署

```bash
# 本地构建 Admin 镜像并启动（默认 8080 端口）
pnpm run docker:admin:up

# 验证服务
curl http://localhost:8080/health
```

## 组件文档

```bash
# 启动 VitePress 文档站
pnpm docs:dev

# 构建文档站
pnpm docs:build
```

## 目录结构

```
├── docs/                   # VitePress 文档站
├── mock/                   # vite-plugin-mock 数据
├── src/
│   ├── api/                # API 接口层
│   ├── assets/styles/      # 全局样式（含暗黑模式）
│   ├── components/         # 通用组件
│   ├── composables/        # 组合式函数
│   ├── directives/         # 自定义指令（v-permission, v-role）
│   ├── enums/              # 枚举定义
│   ├── locales/            # 国际化
│   ├── plugins/            # 插件注册（Element Plus / i18n / 错误处理）
│   ├── router/             # 路由配置与守卫
│   ├── stores/             # Pinia 状态管理
│   ├── types/              # TypeScript 类型声明
│   ├── utils/              # 工具函数（http、storage 等）
│   └── views/              # 页面视图
├── docker/
│   ├── docker-compose.yaml         # Admin 编排（context: 仓库根）
│   ├── nginx/admin.conf
│   └── images/admin/Dockerfile
```
