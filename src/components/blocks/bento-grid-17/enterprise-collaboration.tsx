import Image from 'next/image'

import { Orbiting } from '@/components/ui/orbiting'

const EnterpriseCollaboration = () => {
  return (
    <div className='relative flex h-58 flex-1 items-center justify-center overflow-hidden'>
      <div className='absolute flex size-88 flex-col items-center justify-center'>
        <Orbiting duration={30} radius={175} strokeWidth={1} startingAngle={45}>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img src='/exchanges/aster.png' alt='Aster Logo' className='size-7.5 object-contain' />
          </span>
          <span className='bg-background grid size-13 place-content-center overflow-hidden rounded-full border shadow-sm'>
            <img src='/exchanges/bicoin.png' alt='Bicoin Logo' className='size-full object-cover' />
          </span>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img src='/exchanges/binance.png' alt='Binance Logo' className='size-7.5 object-contain' />
          </span>
          <span className='bg-background grid size-13 place-content-center overflow-hidden rounded-full border shadow-sm'>
            <img src='/exchanges/bitget.png' alt='Bitget Logo' className='size-full object-cover' />
          </span>
        </Orbiting>
        <Orbiting duration={30} radius={135.5} strokeWidth={1} startingAngle={90}>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img src='/exchanges/gate.png' alt='Gate.io Logo' className='size-7.5 object-contain' />
          </span>
          <span className='bg-background grid size-13 place-content-center overflow-hidden rounded-full border shadow-sm'>
            <img src='/exchanges/hlq_logo.png' alt='HLQ Logo' className='size-full object-cover' />
          </span>
        </Orbiting>
        <Orbiting duration={30} radius={90} strokeWidth={1}>
          <span className='bg-background grid size-13 place-content-center overflow-hidden rounded-full border shadow-sm'>
            <img src='/exchanges/okx.png' alt='OKX Logo' className='size-full object-cover' />
          </span>
          <span className='bg-background grid size-13 place-content-center overflow-hidden rounded-full border shadow-sm'>
            <img src='/exchanges/weex.png' alt='WEEX Logo' className='size-full object-cover' />
          </span>
        </Orbiting>

        <Image
          src='/site_logo/logo-small.png'
          alt='跟单猿 Logo'
          width={82}
          height={82}
          className='absolute top-1/2 left-1/2 z-10 size-20.5 -translate-x-1/2 -translate-y-1/2 object-contain'
        />
      </div>
      <div className='from-card pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b to-transparent' />
      <div className='from-card pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent' />
      <div className='from-card pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent' />
      <div className='from-card pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r to-transparent' />
    </div>
  )
}

export default EnterpriseCollaboration
