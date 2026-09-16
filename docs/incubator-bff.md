# Incubator BFF

`/api/incubator/[...path]` 是 `/dashboard/Sync` 模块访问 Incubator 后端的唯一浏览器入口。

- 浏览器沿用现有 Copyapes `Authorization: Bearer <session>`，不保存第二套登录凭据。
- BFF 通过 `COPYAPES_API_INTERNAL_URL` 换取最长 300 秒的 Incubator token，并仅用于当前服务端代理请求。
- Incubator token、Copyapes token、内部 URL 不写日志、不写 Cookie、不写响应体。
- BFF 当前白名单仅开放 `POST /api/incubator/auth/sso/login`；新增业务 API 必须逐项增加路径和方法白名单。
- BFF 只转发查询、JSON/URL 编码表单和不超过 1 MiB 的 body；其他内容类型返回 415，不转发客户端 Cookie 或任意请求头。
- 上游不可达、超时或换票失败统一 fail closed 返回 503；未登录返回 401。
- 回滚：移除 `/dashboard/Sync` 入口或将流量切回旧版本即可；该路由不写本地状态。
