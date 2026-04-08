import { Orbiting } from '@/components/ui/orbiting'

import Logo from '@/assets/svg/logo'

const EnterpriseCollaboration = () => {
  return (
    <div className='relative flex min-h-58 flex-1 items-center justify-center overflow-hidden'>
      <div className='absolute flex size-88 flex-col items-center justify-center'>
        <Orbiting duration={30} radius={175} strokeWidth={1} startingAngle={45}>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-65.png?width=30&format=auto'
              alt='Amazon Logo'
              className='size-7.5 dark:hidden'
            />
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-65-dark.png?width=30&format=auto'
              alt='Amazon Logo Dark'
              className='hidden size-7.5 dark:inline-block'
            />
          </span>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-66.png?width=30&format=auto'
              alt='Netflix Logo'
              className='size-7.5'
            />
          </span>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-70.png?width=30&format=auto'
              alt='Subway Logo'
              className='size-7.5'
            />
          </span>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-69.png?width=30&format=auto'
              alt='Starbucks Logo'
              className='size-7.5'
            />
          </span>
        </Orbiting>
        <Orbiting duration={30} radius={135.5} strokeWidth={1} startingAngle={90}>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-71.png?width=30&format=auto'
              alt='Nike Logo'
              className='size-7.5 dark:hidden'
            />
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-71-dark.png?width=30&format=auto'
              alt='Nike Logo Dark'
              className='hidden size-7.5 dark:inline-block'
            />
          </span>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-72.png?width=30&format=auto'
              alt='H & M Logo'
              className='size-7.5'
            />
          </span>
        </Orbiting>
        <Orbiting duration={30} radius={90} strokeWidth={1}>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-73.png?width=30&format=auto'
              alt='Adidas Logo'
              className='size-7.5 dark:hidden'
            />
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-73-dark.png?width=30&format=auto'
              alt='Adidas Logo Dark'
              className='hidden size-7.5 dark:inline-block'
            />
          </span>
          <span className='bg-background grid size-13 place-content-center rounded-full border shadow-sm'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-67.png?width=30&format=auto'
              alt='Prime Video Logo'
              className='size-7.5'
            />
          </span>
        </Orbiting>

        <Logo className='absolute top-1/2 left-1/2 z-10 size-20.5 -translate-x-1/2 -translate-y-1/2' />
      </div>
      <div className='from-card pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b to-transparent' />
      <div className='from-card pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent' />
      <div className='from-card pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent' />
      <div className='from-card pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r to-transparent' />
    </div>
  )
}

export default EnterpriseCollaboration
