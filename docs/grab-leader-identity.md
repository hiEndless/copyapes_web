# Grab交易员ID校验 v1

后端仓库真源：`contracts/mappings/grab_leader_identity_v1.json`，语义：`contracts/semantic_policies/grab交易员ID校验_v1.md`。

抓取公开主页ID与Cookie跟单项目ID不同：OKX抓取为16位十六进制，币安为ASCII数字。公共URL解析器保持不变，grab提取结果额外经过`src/lib/grab-leader-identity.ts`；弹窗查询、提交和API客户端再次检查，避免绕过页面传入无效ID。仅去首尾空白，保留大小写和大整数精度。用户继续可粘贴主页链接，无效输入沿用既有本地化提示。

执行`npm run test:grab-leader-identity`，测试使用现有TypeScript编译器执行实际TSX处理函数，模拟UI/HTTP边界，校验无效ID不触发请求和有效ID原样发送；不是浏览器交互或生产环境验收。默认后端真源位于本仓库父目录；独立检出前端测试时用`COPYAPES_CONTRACT_ROOT`指向同版本后端的contracts目录。

发布顺序：API先更新，再构建/部署此Next前端。无需爬虫、数据库、Redis或环境变量变更，不新增依赖。历史任务不批量修改。回滚前端版本仍由API校验；回滚API会恢复旧的宽松行为。
