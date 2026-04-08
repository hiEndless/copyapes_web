// React Imports
import type { SVGAttributes } from 'react'
import Image from 'next/image'

const CALogo = (props: SVGAttributes<SVGElement>) => {
  return <Image src='/site_logo/logo-small.png' alt='跟单猿' width={34} height={34} className='object-contain' />
}

export default CALogo
