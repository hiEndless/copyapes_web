import CALogo from '@/assets/svg/copyapes-logo'

import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <CALogo className='size-8' />
      <span className='text-xl font-semibold'>跟单猿</span>
    </div>
  )
}

export default Logo
