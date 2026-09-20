# Incubator BFF

`/api/incubator/[...path]` 是 `/dashboard/Sync` 模块访问 Incubator 后端的唯一浏览器入口。

- 浏览器沿用现有 Copyapes `Authorization: Bearer <session>`，不保存第二套登录凭据。
- BFF 通过 `COPYAPES_API_INTERNAL_URL` 换取最长 300 秒的 Incubator token，并仅用于当前服务端代理请求。
- Incubator token、Copyapes token、内部 URL 不写日志、不写 Cookie、不写响应体。
- BFF 白名单逐项开放 SSO、API 账号、Campaign，以及 Round Setup/Start；动态路由必须显式导出对应 HTTP 方法，其中 Setup 使用 `PUT`。
- BFF 只转发查询、JSON/URL 编码表单和不超过 1 MiB 的 body；其他内容类型返回 415，不转发客户端 Cookie 或任意请求头。
- 上游不可达、超时或换票失败统一 fail closed 返回 503；未登录返回 401。
- 看板在没有本地偏好时默认进入真实模式；模拟模式必须由用户显式开启并有可见标识。
- Round 进入 `STARTING` 后，看板每 2.5 秒刷新 Campaign 列表；收到 Runtime 回执并呈现 `RUNNING`/`ERROR` 等非 `STARTING` 状态后自动停止轮询，页面不调用内部 Runtime 回执接口。
- 终止本轮、整侧晋级和结束项目在后端接口发布前仅可用于显式 Demo；真实模式必须禁用并标记“待接入”，不得通过本地状态模拟成功。
- 真实模式拖拽采用本地草稿：页面以最近一次后端响应中的 Leader 与 SAME/INVERSE assignment 为保存快照，草稿偏离快照时显示“配置未保存”并禁止启动；拖回原值或 `PUT setup` 成功后恢复 clean。
- 回滚：移除 `/dashboard/Sync` 入口或将流量切回旧版本即可；该路由不写本地状态。
