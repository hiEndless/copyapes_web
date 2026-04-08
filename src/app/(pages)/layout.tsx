import type { ReactNode } from 'react'

import {
  LayoutDashboardIcon,
  TelescopeIcon,
  ChartScatterIcon,
  ChartPieIcon,
  GitPullRequestIcon,
  UsersIcon
} from 'lucide-react'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import type { Navigation } from '@/components/layout/header-navigation'

const navigationData: Navigation[] = [
  // {
  //   title: 'Features',
  //   contentClassName: '!w-141 grid-cols-2',
  //   splitItems: true,
  //   items: [
  //     {
  //       type: 'section',
  //       title: 'Analytics & Insights',
  //       items: [
  //         {
  //           title: 'Unified Dashboard',
  //           href: '/#features',
  //           description: 'Get every key business metric in one place.',
  //           icon: <LayoutDashboardIcon className='size-4' />
  //         },
  //         {
  //           title: 'Competitor Tracking',
  //           href: '#',
  //           description: 'Benchmark performance and market trends.',
  //           icon: <TelescopeIcon className='size-4' />
  //         },
  //         {
  //           title: 'Sales Analytics',
  //           href: '#',
  //           description: 'Track revenue growth, conversions & profitability.',
  //           icon: <ChartScatterIcon className='size-4' />
  //         }
  //       ]
  //     },
  //     {
  //       type: 'section',
  //       title: 'Productivity & Optimization',
  //       items: [
  //         {
  //           title: 'Report & Export',
  //           href: '#',
  //           description: 'Share insights quickly with automated reporting.',
  //           icon: <ChartPieIcon className='size-4' />
  //         },
  //         {
  //           title: 'Workflow Scheduling',
  //           href: '#',
  //           description: 'Plan content & operational tasks seamlessly.',
  //           icon: <GitPullRequestIcon className='size-4' />
  //         },
  //         {
  //           title: 'User Management',
  //           href: '#',
  //           description: 'Manage roles and access with complete control.',
  //           icon: <UsersIcon className='size-4' />
  //         }
  //       ]
  //     }
  //   ]
  // },
  {
    title: '首页',
    href: '/#home'
  },
  {
    title: '产品功能',
    href: '/#features'
  },
  {
    title: '产品优势',
    href: '/#benefits'
  },
  {
    title: '用户评价',
    href: '/#testimonials'
  },
  {
    title: '产品价格',
    href: '/#pricing'
  },
  {
    title: '常见问题',
    href: '/#faq'
  },
  {
    title: '联系我们',
    href: '/#contact'
  }
  // {
  //   title: 'Blog',
  //   href: '/blog'
  // }
]

const PagesLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Header Section */}
      <Header navigationData={navigationData} />

      {/* Main Content */}
      <main className='flex flex-1 flex-col *:scroll-mt-16'>{children}</main>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

export default PagesLayout
