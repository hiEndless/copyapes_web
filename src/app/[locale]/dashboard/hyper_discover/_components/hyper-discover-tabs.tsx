'use client'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HotAddressDiscover } from './hot-address-discover'
import { TwitterKolDiscover } from './twitter-kol-discover'

export function HyperDiscoverTabs() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Hyperliquid KOL 发现</h1>
          <p className='text-muted-foreground max-w-2xl text-sm'>
            发现 Hyperliquid 中最有价值的交易者
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Badge variant='secondary'>Hyperliquid</Badge>
          <Badge variant='outline'>热门地址</Badge>
          <Badge variant='outline'>推特 KOL</Badge>
        </div>
      </div>

      <Tabs defaultValue='hot-addresses' className='gap-6'>
        <TabsList className='grid w-full grid-cols-2 sm:w-[320px]'>
          <TabsTrigger value='hot-addresses'>热门地址</TabsTrigger>
          <TabsTrigger value='twitter-kols'>推特 KOL</TabsTrigger>
        </TabsList>

        <TabsContent value='hot-addresses' className='mt-0'>
          <HotAddressDiscover />
        </TabsContent>

        <TabsContent value='twitter-kols' className='mt-0'>
          <TwitterKolDiscover />
        </TabsContent>
      </Tabs>
    </div>
  )
}
