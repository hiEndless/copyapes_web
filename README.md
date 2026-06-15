# copyapes_web

Copyapes 前端（Next.js），生产环境通过 Docker 部署。

## 前置要求

- Docker / Docker Compose
- Git
- 服务器可用内存建议 >= 2GB（`pnpm build` 需要）

## 首次部署

```bash
# 1. 克隆代码
git clone <repo-url> copyapes_web
cd copyapes_web

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，至少填写：
#   WEB_BIND_IP=13.158.141.192   # 站群：该站点专用 IP
#   WEB_PORT=3000
#   NEXT_PUBLIC_APP_URL=https://copyapes.com
#   NEXT_PUBLIC_API_URL=https://api.copyapes.com

# 3. 首次构建并启动
chmod +x scripts/*.sh
./scripts/deploy.sh
```

首次部署完成后，服务监听 `WEB_BIND_IP:WEB_PORT`（默认 `127.0.0.1:3000`）。nginx 反代到同一地址即可，例如 `proxy_pass http://13.158.141.192:3000;`。

## 日常更新

```bash
./scripts/deploy.sh
```

脚本会依次执行：`git pull` → `pnpm install` → `pnpm build` → `docker restart`。

## 手动操作

```bash
# 启动
docker compose up -d

# 停止
docker compose down

# 查看日志
docker compose logs -f web

# 容器内手动构建
docker compose exec web sh -c "corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile && pnpm build"
docker compose restart web
```

## 环境变量说明

| 变量 | 说明 |
|------|------|
| `WEB_BIND_IP` | 宿主机绑定 IP（站群每台站点一个 IP） |
| `WEB_PORT` | 宿主机端口，默认 `3000` |
| `NEXT_PUBLIC_APP_URL` | 站点 URL，用于 SEO canonical |
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile 站点密钥 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console 验证 |

注意：`NEXT_PUBLIC_*` 在 **构建时** 注入，修改 `.env` 后必须重新 `pnpm build`。

## 端口与 IP 绑定

站群服务器在 `.env` 里指定该站点的专用 IP：

```bash
WEB_BIND_IP=13.158.141.192
WEB_PORT=3000
```

等价于 Docker 映射 `13.158.141.192:3000 -> 容器:3000`，其他 IP 不会占用该端口。

临时覆盖示例：

```bash
WEB_BIND_IP=13.158.141.192 WEB_PORT=3000 docker compose up -d
```
