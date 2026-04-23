# ─────────────────────────────────────────────────────────────
#  Stage 1: Build
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# 启用 corepack 以使用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 先复制依赖清单，充分利用 Docker 层缓存
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .

RUN pnpm run build

# ─────────────────────────────────────────────────────────────
#  Stage 2: Serve
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/app.conf

# 从构建阶段复制产物
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
