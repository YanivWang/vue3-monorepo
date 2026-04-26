# 文档站（docs，VitePress）静态资源 → nginx
# 构建上下文：仓库根目录
# 产物目录：docs/.vitepress/dist
# Compose：见 docker/docker-compose.yaml

FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

# 构建上下文无 .git 且无需在镜像内装 git；关闭 lastUpdated 的 git 元数据（见 docs/.vitepress/config.ts）
ENV VITEPRESS_NO_GIT=1

RUN pnpm --filter @vue3-mono/docs build

# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx/docs.conf /etc/nginx/conf.d/app.conf

COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
