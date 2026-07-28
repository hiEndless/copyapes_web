import { TOUR_ANCHORS } from './anchors'

import type { TourDef } from './types'

/** 需要在组件里主动触发的引导，避免散落字符串 */
export const TOUR_IDS = {
  apiFormGuide: 'api-form-guide',
  taskConfigGuide: 'task-config-guide',
  grabConfigGuide: 'grab-config-guide'
} as const

/**
 * 全部引导定义集中在此。
 * 新增引导只需在这里追加，并给对应 DOM 打上 `data-tour`。
 */
export const TOURS: TourDef[] = [
  {
    id: 'dashboard-overview',
    kind: 'page',
    title: '新手上手指引',
    version: 4,
    route: '/dashboard',
    autoStart: true,
    steps: [
      {
        title: '欢迎使用跟单猿',
        description: '花一分钟了解主要功能位置，之后可以在右上角问号按钮里随时重看。'
      },
      {
        anchor: TOUR_ANCHORS.navApi,
        title: '第一步：添加交易所 API',
        description: '跟单需要交易所 API 权限才能下单，先在这里完成 API 绑定，后面的步骤才能正常建单。',
        side: 'right',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.navNotifications,
        title: '第二步：配置消息通知',
        description: '建单前先在这里配好通知渠道。未配置通知时无法创建跟单任务，开仓平仓和异常停任务也会漏消息。',
        side: 'right',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.navCreateTask,
        title: '第三步：创建跟单',
        description: '按信号来源选择跟单方式：交易所自选、币coin、HyperLiquid、API 跟单、Cookie 跟单。',
        side: 'right',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.navHotKol,
        title: '热门带单 KOL',
        description: '不知道跟谁，可以先从这里精选的交易员开始，一键即可建立跟单任务。',
        side: 'right',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.navTaskList,
        title: '我的跟单',
        description: '所有跟单任务的运行状态、收益和明细都在这里查看与调整。',
        side: 'right',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.homeExchanges,
        title: '注册交易所返佣，半价用产品',
        description: '通过下方合作交易所链接注册，可拿约 20% 手续费返佣；注册后联系客服，还能半价开通 VIP。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.headerTour,
        title: '随时重看指引',
        description: '点这里可以重播本页指引，也能单独查看某个功能的说明。',
        side: 'bottom',
        align: 'end'
      }
    ]
  },
  {
    id: 'hot-kol-page',
    kind: 'page',
    title: '热门带单页指引',
    version: 1,
    route: '/dashboard/add_task/hot',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.hotIntro,
        title: '精选交易员来源',
        description: '这里的交易员来自币安排行榜、欧意牛人榜、币coin 等平台，收益可在原平台核对。',
        side: 'bottom',
        align: 'center'
      },
      {
        anchor: TOUR_ANCHORS.hotTraderList,
        title: '选人并开始跟单',
        description: '「当前资金」为 0 表示信号暂不可用。点击「立即跟单」后配置金额与倍数即可建单。',
        side: 'top',
        align: 'center'
      }
    ]
  },
  {
    id: 'api-page',
    kind: 'page',
    title: 'API 添加指引',
    version: 1,
    route: '/dashboard/api',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.apiIpNotice,
        title: '先看 IP 白名单提醒',
        description: '交易权限的 API 必须在交易所把我们的 IP 加入白名单。IP 会变化，长期未登录后可能需要重新授权。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.apiAddButton,
        title: '从这里添加 API',
        description: '点击后是两步：先阅读安全说明，再填写 Key。不清楚字段怎么填时，在第 2 步弹窗右上角点「填写说明」会逐项讲解。',
        side: 'left',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.apiList,
        title: '管理已添加的 API',
        description: '这里能看到每个 API 的余额与状态，也可以改备注或删除。余额约每 10 分钟自动更新一次。',
        side: 'top',
        align: 'center'
      }
    ]
  },
  {
    id: 'api-form-guide',
    kind: 'feature',
    title: 'API 表单填写说明',
    version: 1,
    // 只能在添加 API 弹窗的第 2 步里播放，因此不进帮助菜单
    hiddenInMenu: true,
    unavailableHint: '请先点击「添加 API」进入第 2 步表单，再从弹窗右上角的「填写说明」打开',
    steps: [
      {
        anchor: TOUR_ANCHORS.apiFormExchange,
        title: '选择交易所',
        description: '选你实际持仓的交易所。不同交易所需要的凭据不同，OKX、Bitget、WEEX 还要额外填 Passphrase。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.apiFormLabel,
        title: '备注名称',
        description: '只用于你自己区分账户，例如「主账户」「小号」。创建跟单任务时按这个名字选 API。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.apiFormPermission,
        title: '权限类型要选对',
        description: '「只读」只用来取信号，不会下单；要真正跟单必须选「交易」。这一项选错会导致任务不成交。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.apiFormKey,
        title: '填入 API Key',
        description: '在交易所创建 API 时生成，直接复制粘贴。注意不要开启提币权限。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.apiFormSecret,
        title: 'Secret 与 Passphrase',
        description: 'Secret 只在交易所创建时显示一次，务必先保存好。选了 OKX、Bitget、WEEX 时下方还会要求填 Passphrase。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.apiFormIpWhitelist,
        title: 'IP 白名单缺一不可',
        description: '把这里列出的 IP 全部加到交易所该 API 的受信任 IP。交易权限必须绑定，只读权限不要绑定。',
        side: 'top',
        align: 'center'
      },
      {
        anchor: TOUR_ANCHORS.apiFormSubmit,
        title: '确认绑定',
        description: '提交后会先校验凭据是否可用，校验通过才会保存。失败通常是权限或 IP 白名单没配好。',
        side: 'top',
        align: 'center'
      }
    ]
  },
  {
    id: 'cookie-page',
    kind: 'page',
    title: 'Cookie 获取指引',
    version: 1,
    route: '/dashboard/cookie',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.cookieNotice,
        title: '先看绑定规则',
        description: '每个交易所只能绑一个 Cookie。同所要绑多个时，需要再注册本平台账号分别添加。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.cookiePlugin,
        title: '推荐：浏览器插件自动获取',
        description: '装好插件后登录跟单猿与交易所账号，点自动抓取即可同步到本页。Chrome 可直接安装，其他浏览器看下方入口说明。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.cookieManual,
        title: '备选：手动上传',
        description: '无法装插件或要用手机远程更新时，点「手动上传」，粘贴 Cookie 字符串或整段 cURL，系统会自动提取。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.cookieList,
        title: '在这里查看绑定结果',
        description: '上传成功后会出现在「我的交易所 Cookie」。绿色表示生效中，红色表示已失效，需要重新获取后更新。',
        side: 'top',
        align: 'start'
      }
    ]
  },
  {
    id: 'grab-page',
    kind: 'page',
    title: '跟单抢位指引',
    version: 1,
    route: '/dashboard/grab',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.grabHero,
        title: '抢位要先有 Cookie',
        description: '热门交易员满员时，系统会自动监控并抢占名额。点「获取交易所 Cookie」先完成绑定，没有有效 Cookie 无法创建抢位。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.grabExchange,
        title: '选择目标交易所',
        description: '选 OKX 或币安。切换后下方会自动匹配该交易所的 Cookie。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.grabCookie,
        title: '确认 Cookie 有效',
        description: '这里必须显示「有效」。若提示未找到或已失效，先回 Cookie 获取页重新绑定。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.grabTrader,
        title: '填交易员并解析',
        description: '粘贴交易员主页链接或 ID，点「解析」提取 UID。解析成功后下方会显示识别结果。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.grabSubmit,
        title: '进入金额配置',
        description: '交易所、有效 Cookie、交易员都齐后按钮才可点。点开后可在面板右上角「配置说明」了解跟单金额怎么填。',
        side: 'top',
        align: 'end'
      }
    ]
  },
  {
    id: 'grab-config-guide',
    kind: 'feature',
    title: '抢位配置说明',
    version: 1,
    hiddenInMenu: true,
    unavailableHint: '请先打开抢位配置面板，再从面板右上角的「配置说明」打开',
    steps: [
      {
        anchor: TOUR_ANCHORS.grabTraderInfo,
        title: '核对目标交易员',
        description: '确认头像、昵称和近期收益无误。抢到名额后会按这里的交易员开始跟单。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.grabAmount,
        title: '填写跟单金额',
        description: '这是抢到后用于跟单的投入金额。币安还可选定比或定额；OKX 只需填跟单金额。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.grabStart,
        title: '开始抢位',
        description: '提交后任务进入「进行中」，系统秒级轮询空位。一般 2-3 天内能抢到，也可随时在列表里终止。',
        side: 'top',
        align: 'end'
      }
    ]
  },
  {
    id: 'notifications-page',
    kind: 'page',
    title: '消息通知配置指引',
    version: 1,
    route: '/dashboard/notifications',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.notifyHeader,
        title: '通知设置',
        description: '跟单任务创建前通常需要先配好通知。这里控制「收什么消息」以及「发到哪个渠道」。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.notifyPreferences,
        title: '先选通知类型',
        description: '开关对所有已开启渠道统一生效。交易通知、Cookie/API 失效、任务停止最常用；系统通知不可关闭。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.notifyChannelList,
        title: '选择并开启渠道',
        description: '左侧点选要配置的渠道。配好参数后，记得打开右侧开关真正开启，否则收不到消息。',
        side: 'right',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.notifyChannelForm,
        title: '填写渠道配置',
        description: '右侧按渠道填写：微信需扫码拿授权码，钉钉填 Webhook 与加签密钥，QQ 邮箱填 QQ 号与 SMTP 授权码。',
        side: 'left',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.notifyFormActions,
        title: '保存后再测试',
        description: '先点「保存配置」，再打开左侧开关，最后用「测试连接」确认能收到消息。未开启时测试按钮不可用。',
        side: 'top',
        align: 'end'
      }
    ]
  },
  {
    id: 'invite-page',
    kind: 'page',
    title: '邀请奖励指引',
    version: 1,
    route: '/dashboard/invite',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.inviteHeader,
        title: '邀请奖励',
        description: '邀请好友注册，可解锁额外 API / 跟单额度，好友付费后还能累计销售分成。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.inviteCode,
        title: '复制邀请链接',
        description: '点复制按钮把邀请链接发给好友。好友通过链接注册后计入邀请；有效邀请才会推进下方任务进度。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.inviteProgress,
        title: '任务进度与节点奖励',
        description: '有效邀请达到 3 / 5 / 10 人时，逐步解锁 API 授权、跟单任务额度和资金上限。这些节点奖励仅适用于免费用户。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.inviteCommission,
        title: '销售分成与代理权益',
        description: '这里显示累计分成收益。开通年费 VIP 或年费工作室 VIP 成为代理后，可提现并享受返佣等权益。',
        side: 'left',
        align: 'start'
      }
    ]
  },
  {
    id: 'exchange-task-page',
    kind: 'page',
    title: '交易所自选建单指引',
    version: 1,
    route: '/dashboard/add_task/exchange_task',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.exchangeTaskExchange,
        title: '先选目标交易所',
        description: '选你要跟单的信号来源交易所。选完下方会显示该交易所的成交延迟说明，OKX 和币安规则不同，建议先看一眼。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.exchangeTaskTrader,
        title: '填交易员主页链接或 ID',
        description: '把交易员主页地址整段粘进来，点「解析」自动提取 ID。解析成功后下方会显示识别出的交易员 ID。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.exchangeTaskType,
        title: '选对交易员类型',
        description: 'OKX 分「合约带单」和「个人概况」，币安分「公开带单」和「隐藏带单」。类型和实际不符会导致取不到信号。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.exchangeTaskSubmit,
        title: '进入跟单配置',
        description: '上面三项填全后按钮才可点。点开后是跟单参数面板，里面的字段可以点面板右上角「配置说明」逐项了解。',
        side: 'top',
        align: 'end'
      }
    ]
  },
  {
    id: 'cookie-task-page',
    kind: 'page',
    title: 'Cookie 建单指引',
    version: 1,
    route: '/dashboard/add_task/cookie_task',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.cookieTaskExchange,
        title: '先选目标交易所',
        description: '切换交易所会同时切换下方可用的 Cookie 列表，所以这一步要先定。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.cookieTaskSource,
        title: '选一个可用的 Cookie',
        description:
          '「我的 Cookie」是你自己上传的，会自动选中当前交易所第一个有效项；「发现 Cookie」可以搜别人共享的。只有状态为有效的才能选中。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.cookieTaskTrader,
        title: '填交易员主页链接或 ID',
        description: '把交易员主页地址整段粘进来，点「解析」自动提取 ID。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.cookieTaskType,
        title: '选对交易员类型',
        description: 'OKX 分「合约带单」和「跟单项目」，币安分「带单项目」和「聪明钱」。选错会取不到信号。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.cookieTaskSubmit,
        title: '进入跟单配置',
        description: '交易所、Cookie、交易员、类型四项都齐全后按钮才可点。点开后可在面板右上角「配置说明」了解各项参数。',
        side: 'top',
        align: 'end'
      }
    ]
  },
  {
    id: 'bicoin-task-page',
    kind: 'page',
    title: '币Coin 建单指引',
    version: 1,
    route: '/dashboard/add_task/bicoin_task',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.bicoinTaskAccount,
        title: '先关联币Coin 账号',
        description: '用币Coin App 的手机号和密码登录，点「确认保存」。没关联账号无法搜索交易员，也无法建单。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.bicoinTaskSearch,
        title: '搜索并选中交易员',
        description: '输入交易员昵称后搜索，在结果列表里点一行选中，选中项会高亮。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.bicoinTaskSource,
        title: '选跟单数据源',
        description:
          '「操作记录」速度略快，「合约仓位」稳定性更高。交易员的操作记录里若含现货或买卖模式则无法跟单，可联系客服。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.bicoinTaskSubmit,
        title: '进入跟单配置',
        description: '账号已关联、已选交易员和数据源后按钮才可点。点开后可在面板右上角「配置说明」了解各项参数。',
        side: 'top',
        align: 'end'
      }
    ]
  },
  {
    id: 'hyper-task-page',
    kind: 'page',
    title: 'HyperLiquid 建单指引',
    version: 1,
    route: '/dashboard/add_task/hyper_task',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.hyperTaskLinks,
        title: '先找到要跟的钱包地址',
        description: 'HyperLiquid 是链上交易所，跟单只认钱包地址。点「查询数据」可以到 Coinglass 上找巨鲸和大单地址。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.hyperTaskAddress,
        title: '粘贴钱包地址',
        description: '填交易员的完整钱包地址，以 0x 开头。这里不需要解析，也不用选交易员类型。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.hyperTaskSubmit,
        title: '进入跟单配置',
        description: '地址填好后按钮即可点。点开后可在面板右上角「配置说明」了解各项参数。',
        side: 'top',
        align: 'end'
      }
    ]
  },
  {
    id: 'api-task-page',
    kind: 'page',
    title: 'API 建单指引',
    version: 1,
    route: '/dashboard/add_task/api_task',
    autoStart: true,
    steps: [
      {
        anchor: TOUR_ANCHORS.apiTaskTabs,
        title: '两种信号来源',
        description:
          '「我的 API 信号」是你自己添加的只读 API；「发现 API 信号」可以搜平台其他用户公开的 API，搜到后同样能直接跟。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.apiTaskMyList,
        title: '在卡片上发起跟单',
        description:
          '这一页没有底部的「创建跟单」按钮，直接点卡片下方的「发起跟单」进入配置面板。目前只支持 OKX，其他平台按钮会置灰。',
        side: 'top',
        align: 'start'
      }
    ]
  },
  {
    id: 'task-config-guide',
    kind: 'feature',
    title: '跟单参数配置说明',
    version: 1,
    // 只能在跟单配置面板里播放，因此不进帮助菜单
    hiddenInMenu: true,
    unavailableHint: '请先打开跟单配置面板，再从面板右上角的「配置说明」打开',
    steps: [
      {
        anchor: TOUR_ANCHORS.taskNotifyStatus,
        title: '先确认通知已配置',
        description: '这里显示「未配置」时无法创建任务。点「去配置」绑定通知渠道后再回来建单。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.taskApiSelect,
        title: '选择执行下单的 API',
        description: '这里选的是你自己用来下单的交易 API，不是信号来源。没有可选项时说明还没添加交易权限的 API。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.taskFollowMode,
        title: '跟单模式',
        description: '「固定比例」按「投资额 ÷ 交易员本金 × 倍数」换算你的开仓量，是最常用的模式。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.taskBenchmark,
        title: '交易员本金对标',
        description: '填交易员的本金规模，点「自动获取」可直接拉取。这个值决定跟单比例，填错会导致开仓量偏大或偏小。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.taskInvestment,
        title: '投资额',
        description: '只用于计算跟单比例，不是资金上限，也不会被划走。想放大或缩小仓位就调这个值。',
        side: 'bottom',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.taskRatioPreview,
        title: '核对跟单比例',
        description: '提交前看一眼这里算出的比例。低于 10% 会提示开仓量可能过低而无法成交。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.taskLeverage,
        title: '杠杆模式',
        description: '新账号可能被交易所风控限制，跟不上交易员的高杠杆。改杠杆只影响保证金占用，不改变成交量。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.taskProtocol,
        title: '勾选跟单协议',
        description: '不勾选无法提交。建议先点开协议看一遍风险说明。',
        side: 'top',
        align: 'start'
      },
      {
        anchor: TOUR_ANCHORS.taskSubmit,
        title: '提交建单',
        description: '提交后任务立即开始监听信号，可以到「我的跟单」查看运行状态。',
        side: 'top',
        align: 'end'
      }
    ]
  },
  {
    id: 'feature-api',
    kind: 'feature',
    title: 'API 管理',
    version: 1,
    steps: [
      {
        anchor: TOUR_ANCHORS.navApi,
        title: 'API 管理',
        description: '绑定交易所 API 后才能实际下单，建议只开合约交易权限，不要开提币权限。',
        side: 'right',
        align: 'start'
      }
    ]
  },
  {
    id: 'feature-create-task',
    kind: 'feature',
    title: '创建跟单',
    version: 1,
    steps: [
      {
        anchor: TOUR_ANCHORS.navCreateTask,
        title: '创建跟单',
        description: '展开后按信号来源选择建单方式，不同来源对应不同的交易员池。',
        side: 'right',
        align: 'start'
      }
    ]
  },
  {
    id: 'feature-cookie',
    kind: 'feature',
    title: 'Cookie 获取',
    version: 1,
    steps: [
      {
        anchor: TOUR_ANCHORS.navCookie,
        title: 'Cookie 获取',
        description: 'Cookie 跟单需要的凭据在这里获取，配合浏览器插件使用。',
        side: 'right',
        align: 'start'
      }
    ]
  },
  {
    id: 'feature-grab',
    kind: 'feature',
    title: '跟单抢位',
    version: 1,
    steps: [
      {
        anchor: TOUR_ANCHORS.navGrab,
        title: '跟单抢位',
        description: '热门交易员名额有限时，用抢位功能排队，位置释放后自动占位。',
        side: 'right',
        align: 'start'
      }
    ]
  },
  {
    id: 'feature-notifications',
    kind: 'feature',
    title: '消息通知',
    version: 1,
    steps: [
      {
        anchor: TOUR_ANCHORS.navNotifications,
        title: '消息通知',
        description: '配置 Telegram、企业微信、邮件等渠道，成交与异常会实时推送。',
        side: 'right',
        align: 'start'
      }
    ]
  },
  {
    id: 'feature-invite',
    kind: 'feature',
    title: '邀请奖励',
    version: 1,
    steps: [
      {
        anchor: TOUR_ANCHORS.navInvite,
        title: '邀请奖励',
        description: '分享邀请链接，好友下单后你可获得对应奖励。',
        side: 'right',
        align: 'start'
      }
    ]
  }
]

/** `/zh/dashboard` -> `/dashboard`；未带 locale 前缀时原样返回 */
export const stripLocale = (pathname: string) => {
  if (pathname.startsWith('/dashboard')) return pathname

  return pathname.replace(/^\/[^/]+/, '') || '/'
}

export const findPageTour = (route: string) =>
  TOURS.find(tour => tour.kind === 'page' && tour.route === route)

export const featureTours = TOURS.filter(tour => tour.kind === 'feature' && !tour.hiddenInMenu)

export const getTourById = (id: string) => TOURS.find(tour => tour.id === id)
