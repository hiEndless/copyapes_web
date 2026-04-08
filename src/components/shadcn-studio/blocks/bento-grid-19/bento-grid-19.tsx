import { MotionPreset } from '@/components/ui/motion-preset'

import UserAnalytics from '@/components/shadcn-studio/blocks/bento-grid-19/user-analytics'
import ProductMetrics from '@/components/shadcn-studio/blocks/bento-grid-19/product-metrics'
import CheckOrdersStatus from '@/components/shadcn-studio/blocks/bento-grid-19/check-orders-status'
import EnterpriseCollaboration from '@/components/shadcn-studio/blocks/bento-grid-19/enterprise-collaboration'
import StayInformed from '@/components/shadcn-studio/blocks/bento-grid-19/stay-informed'
import TurnViewersToOrders from '@/components/shadcn-studio/blocks/bento-grid-19/turn-viewers-to-orders'
import ProductManagement from '@/components/shadcn-studio/blocks/bento-grid-19/product-management'

const BentoGrid = () => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8'>
        <div className='grid grid-rows-2 gap-6'>
          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            transition={{ duration: 0.5 }}
            className='bg-card flex flex-col gap-6 overflow-hidden rounded-xl pb-6'
          >
            <UserAnalytics />
            <div className='space-y-2 px-6'>
              <h3 className='text-2xl font-semibold'>User analytics</h3>
              <p className='text-muted-foreground text-sm'>
                Monitor new and returning users effortlessly, gaining complete visibility into who engages with product.
              </p>
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={0.15}
            transition={{ duration: 0.5 }}
            className='bg-card flex flex-col gap-6 overflow-hidden rounded-xl pb-6'
          >
            <ProductMetrics />
            <div className='space-y-2 px-6'>
              <h3 className='text-2xl font-semibold'>Product Metrics</h3>
              <p className='text-muted-foreground text-sm'>
                Visualize key product metrics to making it easy to track growth, performance, and trends.
              </p>
            </div>
          </MotionPreset>
        </div>

        <div className='grid grid-rows-3 gap-6'>
          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={0.3}
            transition={{ duration: 0.5 }}
            className='bg-card flex flex-col gap-6 overflow-hidden rounded-xl py-6'
          >
            <CheckOrdersStatus />
            <div className='space-y-2 px-6'>
              <h3 className='text-2xl font-semibold'>Check orders status</h3>
              <p className='text-muted-foreground text-sm'>
                Consistent UI, powered by a shared framework. From buttons to layouts — everything aligns.
              </p>
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={0.45}
            transition={{ duration: 0.5 }}
            className='bg-card flex flex-col overflow-hidden rounded-xl pb-6'
          >
            <EnterpriseCollaboration />
            <div className='space-y-2 px-6'>
              <h3 className='text-2xl font-semibold'>Enterprise collaboration</h3>
              <p className='text-muted-foreground text-sm'>
                collaborate with leading companies, expand network by gaining insights from top-performing teams.
              </p>
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={0.6}
            transition={{ duration: 0.5 }}
            className='bg-card flex flex-col gap-6 overflow-hidden rounded-xl pb-6'
          >
            <StayInformed />
            <div className='space-y-2 px-6'>
              <h3 className='text-2xl font-semibold'>Stay informed</h3>
              <p className='text-muted-foreground text-sm'>
                Receive all updates related to your products and users in one place so you never miss any information.
              </p>
            </div>
          </MotionPreset>
        </div>

        <div className='grid gap-6 max-md:grid-rows-2 md:max-lg:col-span-2 md:max-lg:grid-cols-2 lg:grid-rows-2'>
          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={0.75}
            transition={{ duration: 0.5 }}
            className='bg-card flex flex-col gap-6 overflow-hidden rounded-xl pb-6'
          >
            <TurnViewersToOrders />
            <div className='space-y-2 px-6'>
              <h3 className='text-2xl font-semibold'>Turn viewers to orders</h3>
              <p className='text-muted-foreground text-sm'>
                Have a clear accounts of product reach and orders with options to check viewers and orders.
              </p>
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 75 }}
            delay={0.9}
            transition={{ duration: 0.5 }}
            className='bg-card flex flex-col gap-6 overflow-hidden rounded-xl pb-6'
          >
            <ProductManagement />
            <div className='space-y-2 px-6'>
              <h3 className='text-2xl font-semibold'>Simplify your product management and scale it with ease</h3>
              <p className='text-muted-foreground text-sm'>
                Track users, monitor performance, and manage updates without complexity. Our platform keeps everything
                organized so your product grows faster, smarter, and with less effort.
              </p>
            </div>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default BentoGrid
