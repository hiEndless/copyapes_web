// React Imports
import type { SVGAttributes } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

const CALogo = (props: SVGAttributes<SVGElement> & { className?: string }) => {
  return (
    <Image
      src='/site_logo/logo-small.png'
      alt='跟单猿'
      width={34}
      height={34}
      className={cn('object-contain', props.className)}
    />
  )
}

export default CALogo
