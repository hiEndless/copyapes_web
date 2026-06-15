#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PNPM_SETUP='corepack enable && corepack prepare pnpm@latest --activate'

run_pnpm() {
  docker compose exec -T web sh -c "${PNPM_SETUP} && $*"
}

if [[ ! -f .env ]]; then
  echo "错误: 缺少 .env，请先执行: cp .env.example .env"
  exit 1
fi

echo "==> 拉取最新代码"
git pull

if [[ ! -d .next ]]; then
  echo "==> 首次部署：安装依赖并构建"
  docker compose run --rm web sh -c "${PNPM_SETUP} && pnpm install --frozen-lockfile && pnpm build"
  echo "==> 启动服务"
  docker compose up -d
else
  echo "==> 确保容器运行"
  docker compose up -d
  echo "==> 安装依赖并构建"
  run_pnpm "pnpm install --frozen-lockfile && pnpm build"
  echo "==> 重启 Web 服务"
  docker compose restart web
fi

echo "==> 完成"
docker compose ps
