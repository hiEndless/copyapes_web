#!/bin/sh
set -e

# Node 22.11.0 自带 corepack 对 pnpm@latest 签名校验会失败，改用 npm 安装固定版本
if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm@9.15.4
fi

exec "$@"
