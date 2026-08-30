# 文档站（docs，VitePress）静态资源 → nginx
# 构建上下文：仓库根目录
# 产物目录：docs/.vitepress/dist
# Compose：见 docker/docker-compose.yaml

# Node 大版本跟 .nvmrc 走（24，当前 Active LTS "Krypton"）：根 package.json 的 engines 要求 node >=24.20.0，
# 且 .npmrc 开了 engine-strict —— 大版本对不上时 pnpm 会直接拒绝安装。
# scripts/check-toolchain.mjs 会校验这一行与 .nvmrc 是同一个大版本。
FROM node:24-alpine AS builder

# 只 enable，不写死版本：pnpm 版本由根 package.json 的 packageManager 字段决定，
# 与 CI 的 pnpm/action-setup（同样不传 version）保持同一个真源。
# 写死版本反而危险：corepack 仍以 packageManager 为准，两边不一致时会拉到另一个
# 版本又跑在不兼容的 Node 上（实测 node:20 + packageManager pnpm@11 → ERR_UNKNOWN_BUILTIN_MODULE）。
RUN corepack enable

WORKDIR /app

COPY . .
# 不加 --dangerously-allow-all-builds：postinstall 放行清单统一在 pnpm-workspace.yaml
# 的 allowBuilds 里维护，镜像里绕开它等于把供应链约束只留给本地
RUN pnpm install --frozen-lockfile

# 构建上下文无 .git 且无需在镜像内装 git；关闭 lastUpdated 的 git 元数据（见 docs/.vitepress/config.ts）
ENV VITEPRESS_NO_GIT=1

RUN pnpm --filter @vue3-monorepo/docs build

# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx/docs.conf /etc/nginx/conf.d/app.conf

COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
