#!/bin/sh
set -e

# Node 22.11.0 自带 corepack 对 pnpm@latest 签名校验会失败，改用 npm 安装固定版本
if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm@9.15.4
fi

# 代码目录与 node_modules 卷分离，package.json / lockfile 变更后需同步依赖
if [ -f package.json ]; then
  echo "[entrypoint] syncing dependencies with pnpm install --frozen-lockfile"
  pnpm install --frozen-lockfile
fi

exec "$@"
