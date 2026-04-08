import {
  BriefcaseBusinessIcon,
  ComponentIcon,
  LayoutDashboardIcon,
  PencilRulerIcon,
  CodepenIcon,
  BlocksIcon
} from 'lucide-react'

import { useTranslations } from 'next-intl'
import { type Features } from '@/components/blocks/benefits/benefits'

export const useBenefits = (): Features => {
  const t = useTranslations('BenefitsData')

  return [
    {
      icon: <ComponentIcon />,
      title: t('crossPlatform.title'),
      description: t('crossPlatform.desc')
    },
    {
      icon: <BlocksIcon />,
      title: t('apiCopy.title'),
      description: t('apiCopy.desc')
    },
    {
      icon: <LayoutDashboardIcon />,
      title: t('reverseCopy.title'),
      description: t('reverseCopy.desc')
    },
    {
      icon: <BriefcaseBusinessIcon />,
      title: t('privateCopy.title'),
      description: t('privateCopy.desc')
    },
    {
      icon: <PencilRulerIcon />,
      title: t('whitelist.title'),
      description: t('whitelist.desc')
    },
    {
      icon: <CodepenIcon />,
      title: t('profitCondition.title'),
      description: t('profitCondition.desc')
    }
  ]
}
