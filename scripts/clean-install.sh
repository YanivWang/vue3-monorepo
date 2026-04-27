#!/usr/bin/env bash
# 排障：删除 workspace 内全部 node_modules（含根目录）后重新 pnpm install
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

if [[ "${1:-}" != "-y" && "${1:-}" != "--yes" ]]; then
  read -r -p "将删除本仓库内全部 node_modules（含根目录）并执行 pnpm install。继续? [y/N] " reply
  case "$reply" in
    y | Y | yes | YES) ;;
    *)
      echo "已取消。"
      exit 0
      ;;
  esac
fi

# 与 pnpm-workspace.yaml 的 packages 一致，避免用 find 误删 node_modules 嵌套子目录
declare -a to_remove=()
if [[ -d "$ROOT/node_modules" ]]; then
  to_remove+=("$ROOT/node_modules")
fi

shopt -s nullglob
for d in "$ROOT"/apps/pc/*; do
  [[ -d "$d" && -d "$d/node_modules" ]] && to_remove+=("$d/node_modules")
done
for d in "$ROOT"/apps/h5/*; do
  [[ -d "$d" && -d "$d/node_modules" ]] && to_remove+=("$d/node_modules")
done
if [[ -d "$ROOT/docs/node_modules" ]]; then
  to_remove+=("$ROOT/docs/node_modules")
fi
for d in "$ROOT"/packages/*; do
  [[ -d "$d" && -d "$d/node_modules" ]] && to_remove+=("$d/node_modules")
done
shopt -u nullglob

for p in "${to_remove[@]}"; do
  echo "正在删除: $p"
  rm -rf "$p"
done

echo "正在执行: pnpm install"
cd "$ROOT"
pnpm install
echo "完成。"
