import {
  BriefcaseBusinessIcon,
  ComponentIcon,
  LayoutDashboardIcon,
  PencilRulerIcon,
  CodepenIcon,
  BlocksIcon
} from 'lucide-react'

import { type Features } from '@/components/blocks/benefits/benefits'

export const benefits: Features = [
  {
    icon: <ComponentIcon />,
    title: '跨平台跟单:',
    description: '可以使用欧意账户跟单币安交易员，也可以使用币安账户跟单欧意交易员。'
  },
  {
    icon: <BlocksIcon />,
    title: 'API跟单/带单:',
    description: '可以自定义上传需要跟单的API，自己或者他人都可以跟随该API进行交易。'
  },
  {
    icon: <LayoutDashboardIcon />,
    title: '反向跟单:',
    description: '对跟单的交易员进行反向交易，交易员开多，你便开空。实时同步开仓平仓。'
  },
  {
    icon: <BriefcaseBusinessIcon />,
    title: '私域跟单:',
    description: '针对私域带单或者隐藏实盘的交易员进行跟单。'
  },
  {
    icon: <PencilRulerIcon />,
    title: '黑/白名单跟单:',
    description: '自定义交易对黑名单或白名单，自主把控交易品种。'
  },
  {
    icon: <CodepenIcon />,
    title: '盈利条件跟单:',
    description: '可设置交易员盈利条件，满足条件后自己才进行跟单交易。'
  }
]
