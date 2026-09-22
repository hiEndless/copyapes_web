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
- 终止本轮、整侧晋级和结束项目通过 BFF 调用 Incubator `terminate` / `end`；真实模式不得用本地 mock 伪装成功。历史持仓仍显示“待接入”。
- 真实模式拖拽采用本地草稿：页面以最近一次后端响应中的 Leader 与 SAME/INVERSE assignment 为保存快照，草稿偏离快照时显示“配置未保存”并禁止启动；拖回原值或 `PUT setup` 成功后恢复 clean。
- 存在真实模式未保存草稿时，切换 Campaign、切换 Demo/真实模式、站内离开以及刷新/关闭页面前必须提示确认；clean 状态和 Demo 不注册离开守卫。
- 创建 Campaign 的账号预筛选只隐藏处于 `STARTING/RUNNING/PAUSING` Round 的 Runtime Claim 账号，并显示隐藏数量；`READY/ERROR/COMPLETED` 成员不视为运行占用，最终并发互斥仍以后端 Start 原子 Claim 为准。
- Campaign 状态采用显式白名单映射：仅后端 `ACTIVE` 映射为前端 `RUNNING`，`ERROR` 与未知值分别显示异常/未知状态。真实收益、交易记录和当前持仓已走只读 API。领单仓位与成员当前持仓都按 RoundMember 查询交易所，浏览器按轮次和账号缓存 20 秒，避免重复请求。结束项目的服务端仍用领单 Redis 快照判断是否还有仓。余额和历史持仓接入前统一显示“待接入”，不得用零值或 mock 数据伪装真实结果。
- Campaign 只有 `READY/RUNNING` 可进入 Round Setup，只有 `RUNNING` 可执行运行态操作；`ERROR/UNKNOWN/COMPLETED/PAUSED` 对拖拽、Setup 与 Start 一律失败关闭。
- 回滚：移除 `/dashboard/Sync` 入口或将流量切回旧版本即可；该路由不写本地状态。
