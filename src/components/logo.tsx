import { useTranslations } from 'next-intl'

import CALogo from '@/assets/svg/copyapes-logo'

import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  const t = useTranslations('Logo')

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <CALogo className='size-8' />
      <span className='text-md font-semibold'>{t('brandName')}</span>
    </div>
  )
}

export default Logo
