# Vite 构建优化

## 开发体验

- **Vite** 提供快速冷启动与 HMR；多包并行开发可用根 `pnpm run dev` 或单端 `admin:dev` / `h5:dev` / `docs:dev`（见 [代码质量与规范约束](./quality-gates.md)）。
- 改 `packages/shared` 后建议跑**全 workspace** `pnpm run typecheck`，避免只绿单端。

## 生产构建（以 PC 模板为参考）

- **代码分割**：路由级懒加载（`import.meta.glob` 等），业务 chunk 与 `element-plus` / `vue` / `vue-i18n` 等分块策略见各应用 `vite.config` 中 `build.rollupOptions` / `manualChunks`（与 [架构说明 — 构建优化](./architecture.md#build-optimization) 一致）。
- **压缩**：生产环境可启用 Gzip/Brotli，由**静态服务器或 nginx** 提供；Docker 场景见 [部署与 Docker](./deploy.md) 与 `docker/nginx`。
- **分析**：通过各应用 `.env` 中 **`VITE_ANALYZE`**（及对应 Rollup/插件开关）在本地生成 bundle 分析报告；`VITE_SOURCEMAP` 按发布策略与合规要求开启。

## H5 注意点

- 与移动端布局相关的插件如 `postcss-mobile-forever`、Bridge 与 WebView 首屏，需在真机/弱网环境抽样验证。
- 避免在首屏同步引入过重依赖；`bridge` 与宿主协议见 `apps/h5/h5-template/docs/bridge-protocol.md`。
