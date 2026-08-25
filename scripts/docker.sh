#!/usr/bin/env bash
# docker.sh：统一从 scripts/ 调度 docker/docker-compose.yaml
# 由根 package.json 的 docker:* 脚本包装（docker:up / docker:down / docker:logs 及各服务专用别名）
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yaml"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-vue3-monorepo}"

compose() {
  docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" "$@"
}

case "${1:-}" in
  up | start)
    echo "Building & starting stack (compose: $COMPOSE_FILE)..."
    compose up --build -d "${@:2}"
    echo "Admin: http://localhost:${ADMIN_PORT:-8080}  （默认 /api 反代宿主机 :3000；无后端会登录失败）"
    echo "H5:    http://localhost:${H5_PORT:-8081}  （默认 /api 反代宿主机 :3000）"
    echo "Docs:  http://localhost:${DOCS_PORT:-8082}"
    ;;
  down | stop)
    compose down "${@:2}"
    ;;
  logs)
    compose logs -f "${2:-}"
    ;;
  build)
    compose build "${@:2}"
    ;;
  *)
    echo "Usage: $0 {up|start|stop|down|logs|build} [service or extra docker compose args]"
    echo "  Environment: COMPOSE_PROJECT, ADMIN_PORT, H5_PORT, DOCS_PORT (see docker/docker-compose.yaml)"
    exit 1
    ;;
esac
