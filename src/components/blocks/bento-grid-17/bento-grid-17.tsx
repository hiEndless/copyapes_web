import type { Transition } from 'motion/react'

import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'

import AssignTaskCard from '@/components/blocks/bento-grid-17/assign-task-card'
import type { TeamImagesType } from '@/components/blocks/bento-grid-17/assign-task-card'
import EnterpriseCollaboration from '@/components/blocks/bento-grid-17/enterprise-collaboration'
import { Cover } from '@/components/blocks/bento-grid-17/cover'
import Globe from '@/components/blocks/bento-grid-17/globe'

const TeamImages: TeamImagesType[] = [
  {
    images: [
      { index: 0, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-81.png' },
      { index: 2, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-79.png' },
      { index: 3, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-78.png' },
      { index: 7, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-80.png' }
    ],
    team: '专业交易员'
  },
  {
    images: [
      { index: 1, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-76.png' },
      { index: 3, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-77.png' },
      { index: 5, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-82.png' },
      { index: 8, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-78.png' }
    ],
    team: '带单KOL'
  },
  {
    images: [
      { index: 0, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-78.png' },
      { index: 3, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-81.png' },
      { index: 5, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-80.png' },
      { index: 7, src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-77.png' }
    ],
    team: '交易社群'
  }
]

/** tween 比默认 spring 更省算力；时长短一点进视口更干脆 */
const bentoEnter: Transition = {
  type: 'tween',
  duration: 0.32,
  ease: [0.25, 0.1, 0.25, 1]
}

const BentoGrid = () => {
  return (
    <section
      id='features'
      className='bg-background [content-visibility:auto] py-8 sm:py-16 lg:py-24'
    >
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <MotionPreset
          fade
          slide={{ direction: 'down', offset: 50 }}
          transition={bentoEnter}
          className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'
        >
          <p className='text-primary text-sm font-medium uppercase'>产品功能</p>

          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>功能强大，易于使用</h2>

          <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>全球服务节点，极速跟单。</p>
        </MotionPreset>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {/* Column 1 */}
          {/* Assign Task Card */}
          <MotionPreset fade slide={{ direction: 'down', offset: 12 }} transition={bentoEnter} delay={0.04}>
            <AssignTaskCard TeamImages={TeamImages} />
          </MotionPreset>

          {/* Column 2 */}
          <div className='grid grid-rows-[auto_auto] gap-6'>
            {/* Boost Efficiency Card */}
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 12 }}
              delay={0.08}
              transition={bentoEnter}
            >
              <Card className='h-full'>
                <Cover className='flex h-27 items-center justify-center overflow-hidden'>
                  <img
                    src='https://cdn.shadcnstudio.com/ss-assets/blocks/bento-grid/image-97.png'
                    alt='rocket'
                    className='h-19.25'
                    decoding='async'
                    loading='lazy'
                  />
                </Cover>
                <CardContent className='flex flex-col gap-1'>
                  <h3 className='text-lg font-medium'>极速跟单</h3>
                  <p className='text-muted-foreground'>
                    紧靠交易所机房，实时毫秒级跟单，将跟单滑点降至最低。
                  </p>
                </CardContent>
              </Card>
            </MotionPreset>

            {/* Enterprise collaboration Card */}
            <MotionPreset
              fade
              slide={{ direction: 'down', offset: 12 }}
              delay={0.12}
              transition={bentoEnter}
            >
              <Card className='flex flex-col justify-between gap-0 overflow-hidden p-0'>
                <div className='relative flex w-full flex-1 items-center justify-center'>
                  <EnterpriseCollaboration />
                </div>
                <CardContent className='flex w-full flex-col gap-1 p-6 pt-0'>
                  <h3 className='text-lg font-medium'>多交易所支持</h3>
                  <p className='text-muted-foreground'>
                    支持全球主流交易所，如币安、欧意。自动转换交易对代码，按比例计算交易量，实现跨交易所实时跟单。
                  </p>
                </CardContent>
              </Card>
            </MotionPreset>
          </div>

          {/* Column 3 */}
          {/* Global Schedule Card */}
          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 12 }}
            delay={0.16}
            transition={bentoEnter}
            className='h-full min-h-150 md:max-xl:col-span-2'
          >
            <Card className='h-full justify-between overflow-hidden pb-0'>
              <CardContent className='flex flex-col gap-1'>
                <h3 className='text-lg font-medium'>全球节点部署</h3>
                <p className='text-muted-foreground'>
                  全球多个地区部署服务，自建全球代理IP池，毫秒级爬虫服务，确保跟单服务快速稳定。
                </p>
              </CardContent>
              <div className='relative flex-1'>
                <Globe className='-bottom-70 -left-12 size-200 md:max-xl:-bottom-90 md:max-xl:left-1/2 md:max-xl:-translate-x-1/2' />
              </div>
            </Card>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default BentoGrid
