import type { Metadata } from 'next'

import { Link } from '@/i18n/routing'

import { PrimaryFlowButton } from '@/components/ui/flow-button'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

import Icon404 from '@/assets/svg/404'

export const metadata: Metadata = {
  title: '404',
  robots: NO_INDEX_ROBOTS
}

const NotFound = () => {
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center gap-9 p-6'>
      <Icon404 className='h-auto w-full sm:h-120 sm:w-146' />
      <div className='flex flex-col items-center gap-4 text-center'>
        <h1 className='text-xl font-semibold sm:text-2xl'>404</h1>
        <PrimaryFlowButton size='lg' asChild>
          <Link href='/'>Home</Link>
        </PrimaryFlowButton>
      </div>
    </div>
  )
}

export default NotFound
