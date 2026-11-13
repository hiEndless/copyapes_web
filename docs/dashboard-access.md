# 后台角色访问控制 v1

后端真源：contracts/semantic_policies/后台角色访问控制_v1.md；接口分类dashboard_access_v1.json及角色响应schema。新增GET /api/auth/dashboard-access/使用有效token核验服务端角色，禁止用本地userInfo控制后台授权。

DashboardShell统一包裹DashboardAccessProvider与DashboardRouteGuard，所有admin/partner子路由、侧边栏和个人菜单入口使用内存核验角色；普通页面不受角色门禁影响。身份/路径变化即不复用旧快照，聚焦/身份/存储事件重验，generation防止旧授权响应覆盖退出或撤权结果。核验中、失败或无角色不挂载受限子页面。后端独立鉴权，不声称浏览器自身不可被用户修改。

验证：npm run test:dashboard-access执行纯状态竞态和真实React门禁渲染；npm run test:dashboard-access:browser用本机Chrome、新临时profile、独立临时前端目录及localhost模拟API执行篡改缓存、直接路由、合法管理员、撤权和接口不可用演练。临时目录先用Next生产模式编译（Webpack），再start；仅营销文档和字体为fixture，授权代码不修改。网络拦截只允许本机两个测试地址，不读取本地.env或复用浏览器登录态，不占用现有.next/dev锁。Chrome路径可用DASHBOARD_TEST_CHROME指定，无新增依赖。浏览器演练使用模拟角色服务，不等同于生产链路验收。

2026-11-14：前端6组门禁/竞态回归、既有grab5组回归、类型检查通过；隔离生产编译和Chrome五场景全部通过。独立Codex复验后端99项、前端6组，并补94次跨角色HTTP负探针和实际Provider事件探针。原版隔离生产编译亦通过，但公开内容源网络失败造成部分静态文档缺失，不作为内容完整性验收。完整quick有既有tracked-key安全阻断，未解除、未绕过。

发布先全部API后前端；旧API无新接口会使新前端拒绝进入后台。回滚前端可保留后端安全边界，后端回滚会恢复旧缺口。无需环境变量、数据迁移或爬虫重建。普通邀请返佣接口保留，不将非代理用户的正常邀请权益一并关闭。
