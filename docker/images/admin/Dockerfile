# PC 管理端（apps/pc/pc-admin-template）静态资源 → nginx
# 构建上下文：仓库根目录
#   docker build -f docker/images/admin/Dockerfile .
# Compose：见 docker/docker-compose.yaml（context: .., dockerfile: docker/images/admin/Dockerfile）

FROM node:20-alpine AS builder

ARG BUILD_MODE=production

RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

WORKDIR /app

# 须先 COPY 全仓再 install：否则 workspace 子包未就绪时 pnpm 无法把各应用依赖链入子目录 node_modules，vue-tsc 会报找不到 vite/client 等
COPY . .
RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

RUN pnpm --filter @vue3-mono/admin build --mode ${BUILD_MODE}

# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx/admin.conf /etc/nginx/conf.d/app.conf

COPY --from=builder /app/apps/pc/pc-admin-template/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
