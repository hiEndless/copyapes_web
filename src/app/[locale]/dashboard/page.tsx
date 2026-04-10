'use client'

import { useEffect, useState, type ComponentType } from 'react'

import { useTheme } from 'next-themes'
import {
  ActivityIcon,
  BellIcon,
  BellRingIcon,
  BookMarkedIcon,
  ChevronRightIcon,
  CircleOffIcon,
  CopyIcon,
  DollarSignIcon,
  FacebookIcon,
  FolderIcon,
  InstagramIcon,
  LanguagesIcon,
  LayoutGridIcon,
  LayoutListIcon,
  LinkedinIcon,
  LockKeyholeIcon,
  MailIcon,
  MailOpenIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  MoonStarIcon,
  MousePointerClickIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SunIcon,
  TicketCheckIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  TwitterIcon,
  UserIcon,
  Share2,
  Cookie,
  LandPlot,
  Flame,
  UserStar,
  ShieldUser,
  Unplug,
  MessageCircleWarning,
  Bug
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

import SearchDialog from '@/components/shadcn-studio/blocks/dashboard/dialog-search'
import LanguageDropdown from '@/components/shadcn-studio/blocks/dashboard/dropdown-language'
import ActivityDialog from '@/components/shadcn-studio/blocks/dashboard/dialog-activity'
import NotificationDropdown from '@/components/shadcn-studio/blocks/dashboard/dropdown-notification'
import MonthlyCampaignCard from '@/components/shadcn-studio/blocks/dashboard/widget-monthly-campaign'
import ProfileDropdown from '@/components/shadcn-studio/blocks/dashboard/dropdown-profile'
import StatisticsCard, {
  type StatisticsCardProps
} from '@/components/shadcn-studio/blocks/dashboard/statistics-card-03'
import StatisticsCardWithSvg from '@/components/shadcn-studio/blocks/dashboard/statistics-card-04'
import TotalEarningCard from '@/components/shadcn-studio/blocks/dashboard/chart-total-earning'
import TotalIncomeCard from '@/components/shadcn-studio/blocks/dashboard/chart-total-income'
import ForBusinessSharkCard from '@/components/shadcn-studio/blocks/dashboard/widget-for-business-shark'
import VehiclesConditionCard from '@/components/shadcn-studio/blocks/dashboard/widget-vehicles-condition'
import UserDatatable, { type Item } from '@/components/shadcn-studio/blocks/dashboard/datatable-user'

import Logo from '@/components/logo'
import CustomersCardSvg from '@/assets/svg/customers-card-svg'

type MenuSubItem = {
  label: string
  href: string
  badge?: string
}

type MenuItem = {
  icon: ComponentType
  label: string
} & (
  | {
      href: string
      badge?: string
      items?: never
    }
  | { href?: never; badge?: never; items: MenuSubItem[] }
)

const menuItems: MenuItem[] = [
  {
    icon: LayoutGridIcon,
    label: '首页',
    href: '#'
  },
  {
    icon: DollarSignIcon,
    label: '订阅服务',
    href: '#'
  },
  {
    icon: Share2,
    label: '邀请好友',
    href: '#'
  }
]

const adminItems: MenuItem[] = [
  {
    icon: ShieldUser,
    label: '系统后台',
    href: '#'
  },
  {
    icon: UserStar,
    label: '代理商后台',
    items: [
      { label: '代理设置', href: '#' },
      { label: '返佣设置', href: '#' },
      { label: '兑换码创建', href: '#' },
      { label: '推广用户列表', href: '#' },
      { label: 'VIP 客户列表', href: '#' },
      { label: '收益流水', href: '#' },
      { label: '提现流水', href: '#' }
    ]
  }
]

const copyItems: MenuItem[] = [
  {
    icon: LayoutListIcon,
    label: '跟单任务列表',
    href: '#'
  },
  {
    icon: CopyIcon,
    label: '创建跟单',
    items: [
      { label: '交易所', href: '#' },
      { label: '币coin', href: '#' },
      { label: 'HyperLiquid', href: '#' },
      { label: 'API 跟单', href: '#' },
      { label: '交易所 Cookie 跟单', href: '#' }
    ]
  },
  {
    icon: Flame,
    label: '热门推荐',
    href: '#'
  },
  {
    icon: Flame,
    label: 'HyperLiquid推荐',
    href: '#'
  }
]

const toolsItems: MenuItem[] = [
  {
    icon: Cookie,
    label: 'Cookie 获取',
    href: '#'
  },
  {
    icon: LandPlot,
    label: '跟单抢位',
    href: '#',
    badge: '4天必中'
  }
]

const settingsItems: MenuItem[] = [
  {
    icon: Unplug,
    label: 'API 管理',
    href: '#'
  },
  {
    icon: SettingsIcon,
    label: '账户设置',
    href: '#'
  },
  {
    icon: MessageCircleWarning,
    label: '消息通知',
    href: '#'
  }
]

// Statistics card data
const StatisticsCardData: StatisticsCardProps[] = [
  {
    icon: <TicketCheckIcon />,
    title: 'Total Sales',
    value: '$13.4k',
    trend: 'up',
    changePercentage: '+38%',
    badgeContent: 'Last 6 months',
    iconClassName: 'bg-chart-1/10 text-chart-1'
  },
  {
    icon: <ShoppingCartIcon />,
    title: 'Total Orders',
    value: '155K',
    trend: 'up',
    changePercentage: '+22%',
    badgeContent: 'Last 4 months',
    iconClassName: 'bg-chart-2/10 text-chart-2'
  },
  {
    icon: <DollarSignIcon />,
    title: 'Total Profit',
    value: '$89.34k',
    trend: 'down',
    changePercentage: '-16%',
    badgeContent: 'Last One year',
    iconClassName: 'bg-chart-3/10 text-chart-3'
  },
  {
    icon: <BookMarkedIcon />,
    title: 'Bookmarks',
    value: '$1,200',
    trend: 'up',
    changePercentage: '+38%',
    badgeContent: 'Last 6 months',
    iconClassName: 'bg-chart-4/10 text-chart-4'
  }
]

// Campaigns data
const campaignData = [
  {
    icon: MailIcon,
    title: 'Emails',
    value: '14,250',
    percentage: '0.3%',
    avatarClassName: 'bg-chart-1/10 text-chart-1'
  },
  {
    icon: MailOpenIcon,
    title: 'Opened',
    value: '4,523',
    percentage: '3.1%',
    avatarClassName: 'bg-chart-2/10 text-chart-2'
  },
  {
    icon: MousePointerClickIcon,
    title: 'Clicked',
    value: '1,250',
    percentage: '1.3%',
    avatarClassName: 'bg-chart-4/10 text-chart-4'
  },
  {
    icon: BellRingIcon,
    title: 'Subscribed',
    value: '750',
    percentage: '9.8%',
    avatarClassName: 'bg-chart-3/10 text-chart-3'
  },
  {
    icon: TriangleAlertIcon,
    title: 'Errors',
    value: '20',
    percentage: '1.5%',
    avatarClassName: 'bg-chart-5/10 text-chart-5'
  },
  {
    icon: CircleOffIcon,
    title: 'Unsubscribed',
    value: '86',
    percentage: '0.6%'
  }
]

// Vehicle condition data
const vehicleConditionData = [
  {
    condition: 'Excellent',
    details: '12% increase',
    progressValue: 55,
    changePercentage: '+25%',
    progressClassName: 'stroke-chart-1'
  },
  {
    condition: 'Good',
    details: '24 vehicles',
    progressValue: 20,
    changePercentage: '+30%',
    progressClassName: 'stroke-chart-2'
  },
  {
    condition: 'Average',
    details: '182 Tasks',
    progressValue: 12,
    changePercentage: '-15%',
    progressClassName: 'stroke-chart-3'
  },
  {
    condition: 'Bad',
    details: '9 vehicles',
    progressValue: 7,
    changePercentage: '+35%',
    progressClassName: 'stroke-chart-4'
  },
  {
    condition: 'Not Working',
    details: '3 vehicles',
    progressValue: 4,
    changePercentage: '-2%',
    progressClassName: 'stroke-chart-5'
  },
  {
    condition: 'Scraped',
    details: '2 vehicles',
    progressValue: 2,
    changePercentage: '+1%'
  }
]

// User data for datatable
const userData: Item[] = [
  {
    id: '1',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
    fallback: 'JA',
    user: 'Jack Alfredo',
    email: 'jack.alfredo@shadcnstudio.com',
    role: 'maintainer',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'active'
  },
  {
    id: '2',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png',
    fallback: 'SM',
    user: 'Sarah Mitchell',
    email: 'sarah.mitchell@company.com',
    role: 'admin',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'active'
  },
  {
    id: '3',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
    fallback: 'RC',
    user: 'Robert Chen',
    email: 'robert.chen@startup.io',
    role: 'editor',
    plan: 'team',
    billing: 'manual-paypal',
    status: 'pending'
  },
  {
    id: '4',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png',
    fallback: 'EW',
    user: 'Emily Wilson',
    email: 'emily.wilson@freelance.com',
    role: 'author',
    plan: 'basic',
    billing: 'manual-cash',
    status: 'inactive'
  },
  {
    id: '5',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png',
    fallback: 'DG',
    user: 'David Garcia',
    email: 'david.garcia@agency.net',
    role: 'subscriber',
    plan: 'company',
    billing: 'auto-debit',
    status: 'active'
  },
  {
    id: '6',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png',
    fallback: 'LT',
    user: 'Lisa Thompson',
    email: 'lisa.thompson@design.co',
    role: 'editor',
    plan: 'team',
    billing: 'manual-paypal',
    status: 'active'
  },
  {
    id: '7',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-7.png',
    fallback: 'MA',
    user: 'Michael Anderson',
    email: 'michael.anderson@tech.com',
    role: 'maintainer',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'pending'
  },
  {
    id: '8',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-8.png',
    fallback: 'JR',
    user: 'Jessica Rodriguez',
    email: 'jessica.rodriguez@startup.com',
    role: 'author',
    plan: 'basic',
    billing: 'manual-cash',
    status: 'active'
  },
  {
    id: '9',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-9.png',
    fallback: 'CB',
    user: 'Christopher Brown',
    email: 'chris.brown@corporate.org',
    role: 'admin',
    plan: 'company',
    billing: 'auto-debit',
    status: 'inactive'
  },
  {
    id: '10',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-10.png',
    fallback: 'AD',
    user: 'Amanda Davis',
    email: 'amanda.davis@marketing.io',
    role: 'subscriber',
    plan: 'basic',
    billing: 'manual-paypal',
    status: 'active'
  },
  {
    id: '11',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-11.png',
    fallback: 'JJ',
    user: 'James Johnson',
    email: 'james.johnson@development.com',
    role: 'maintainer',
    plan: 'team',
    billing: 'auto-debit',
    status: 'pending'
  },
  {
    id: '12',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-12.png',
    fallback: 'MW',
    user: 'Maria Williams',
    email: 'maria.williams@creative.net',
    role: 'editor',
    plan: 'company',
    billing: 'manual-cash',
    status: 'active'
  },
  {
    id: '13',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-13.png',
    fallback: 'RT',
    user: 'Ryan Taylor',
    email: 'ryan.taylor@studio.com',
    role: 'author',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'inactive'
  },
  {
    id: '14',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-14.png',
    fallback: 'NK',
    user: 'Nicole Kim',
    email: 'nicole.kim@digital.agency',
    role: 'subscriber',
    plan: 'team',
    billing: 'manual-paypal',
    status: 'active'
  },
  {
    id: '15',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-15.png',
    fallback: 'AL',
    user: 'Andrew Lee',
    email: 'andrew.lee@consulting.biz',
    role: 'admin',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'pending'
  },
  {
    id: '16',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png',
    fallback: 'SM',
    user: 'Stephanie Martinez',
    email: 'stephanie.martinez@media.com',
    role: 'editor',
    plan: 'basic',
    billing: 'manual-cash',
    status: 'active'
  },
  {
    id: '17',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-17.png',
    fallback: 'KW',
    user: 'Kevin White',
    email: 'kevin.white@innovation.co',
    role: 'maintainer',
    plan: 'company',
    billing: 'auto-debit',
    status: 'inactive'
  },
  {
    id: '18',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-18.png',
    fallback: 'RH',
    user: 'Rachel Harris',
    email: 'rachel.harris@solutions.org',
    role: 'author',
    plan: 'team',
    billing: 'manual-paypal',
    status: 'active'
  },
  {
    id: '19',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-19.png',
    fallback: 'BT',
    user: 'Brian Turner',
    email: 'brian.turner@platform.io',
    role: 'subscriber',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'pending'
  },
  {
    id: '20',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-20.png',
    fallback: 'CM',
    user: 'Catherine Moore',
    email: 'catherine.moore@ventures.com',
    role: 'admin',
    plan: 'basic',
    billing: 'manual-cash',
    status: 'active'
  },
  {
    id: '21',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-21.png',
    fallback: 'TN',
    user: 'Thomas Nelson',
    email: 'thomas.nelson@design.studio',
    role: 'editor',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'active'
  },
  {
    id: '22',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-22.png',
    fallback: 'SP',
    user: 'Sophie Parker',
    email: 'sophie.parker@freelance.pro',
    role: 'author',
    plan: 'team',
    billing: 'manual-paypal',
    status: 'inactive'
  },
  {
    id: '23',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-23.png',
    fallback: 'AR',
    user: 'Alexander Reed',
    email: 'alex.reed@innovation.labs',
    role: 'maintainer',
    plan: 'company',
    billing: 'manual-cash',
    status: 'pending'
  },
  {
    id: '24',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-24.png',
    fallback: 'MG',
    user: 'Maya Gonzalez',
    email: 'maya.gonzalez@creative.agency',
    role: 'subscriber',
    plan: 'basic',
    billing: 'auto-debit',
    status: 'active'
  },
  {
    id: '25',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-25.png',
    fallback: 'JS',
    user: 'Jordan Smith',
    email: 'jordan.smith@tech.solutions',
    role: 'admin',
    plan: 'enterprise',
    billing: 'manual-paypal',
    status: 'pending'
  }
]

const SidebarGroupedMenuItems = ({ data, groupLabel }: { data: MenuItem[]; groupLabel?: string }) => {
  return (
    <SidebarGroup>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {data.map(item =>
            item.items ? (
              <Collapsible className='group/collapsible' key={item.label}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.label}>
                      <item.icon />
                      <span>{item.label}</span>
                      <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map(subItem => (
                        <SidebarMenuSubItem key={subItem.label}>
                          <SidebarMenuSubButton className='justify-between' asChild>
                            <a href={subItem.href}>
                              {subItem.label}
                              {subItem.badge && (
                                <span className='bg-primary/10 flex h-5 min-w-5 items-center justify-center rounded-full text-xs'>
                                  {subItem.badge}
                                </span>
                              )}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton tooltip={item.label} asChild>
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
                {item.badge && <SidebarMenuBadge className='bg-primary/10 rounded-full'>{item.badge}</SidebarMenuBadge>}
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const DashboardShell = () => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className='flex min-h-dvh w-full'>
      <SidebarProvider>
        <Sidebar collapsible='icon'>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size='lg' className='gap-2.5 !bg-transparent [&>svg]:size-8' asChild>
                  <a href='/'>
                    <Logo />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroupedMenuItems data={menuItems} />
            <SidebarGroupedMenuItems data={adminItems} groupLabel='系统服务' />
            <SidebarGroupedMenuItems data={copyItems} groupLabel='跟单服务' />
            <SidebarGroupedMenuItems data={toolsItems} groupLabel='工具服务' />
            <SidebarGroupedMenuItems data={settingsItems} groupLabel='系统设置' />
          </SidebarContent>
        </Sidebar>
        <div className='flex flex-1 flex-col'>
          <header className='before:bg-background/60 sticky top-0 z-50 before:absolute before:inset-0 before:mask-[linear-gradient(var(--card),var(--card)_18%,transparent_100%)] before:backdrop-blur-md'>
            <div className='bg-card relative z-51 mx-auto mt-3 flex w-[calc(100%-2rem)] max-w-[calc(1280px-3rem)] items-center justify-between rounded-xl border px-6 py-2 sm:w-[calc(100%-3rem)]'>
              <div className='flex items-center gap-1.5 sm:gap-4'>
                <SidebarTrigger className='[&_svg]:!size-5' />
                <Separator orientation='vertical' className='hidden !h-4 sm:block' />
                {/* <SearchDialog
                  trigger={
                    <>
                      <Button variant='ghost' className='hidden !bg-transparent px-1 py-0 font-normal sm:block'>
                        <div className='text-muted-foreground hidden items-center gap-1.5 text-sm sm:flex'>
                          <SearchIcon />
                          <span>Type to search...</span>
                        </div>
                      </Button>
                      <Button variant='ghost' size='icon' className='sm:hidden'>
                        <SearchIcon />
                        <span className='sr-only'>Search</span>
                      </Button>
                    </>
                  }
                /> */}
              </div>
              <div className='flex items-center gap-1.5'>
                <LanguageDropdown
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <LanguagesIcon />
                    </Button>
                  }
                />
                <Button
                  variant='ghost'
                  size='icon'
                  className='relative'
                  onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
                >
                  <MoonStarIcon className='scale-100 dark:scale-0' />
                  <SunIcon className='absolute scale-0 dark:scale-100' />
                  <span className='sr-only'>Toggle theme</span>
                </Button>
                <ActivityDialog
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <ActivityIcon />
                    </Button>
                  }
                />
                <ActivityDialog
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <Bug />
                    </Button>
                  }
                />
                <NotificationDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='relative'>
                      <BellIcon />
                      <span className='bg-destructive absolute top-2 right-2.5 size-2 rounded-full' />
                    </Button>
                  }
                />
                <ProfileDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='size-9.5'>
                      <Avatar className='size-9.5 rounded-md'>
                        <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>
          <main className='mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6'>
            <div className='grid grid-cols-2 gap-6 xl:grid-cols-3'>
              <div className='col-span-2 grid grid-cols-2 gap-6 xl:grid-cols-4'>
                {StatisticsCardData.map((card, index) => (
                  <StatisticsCard
                    key={index}
                    icon={card.icon}
                    title={card.title}
                    value={card.value}
                    trend={card.trend}
                    changePercentage={card.changePercentage}
                    badgeContent={card.badgeContent}
                    className='shadow-none'
                    iconClassName={card.iconClassName}
                  />
                ))}
              </div>

              <StatisticsCardWithSvg
                title='Customers'
                badgeContent='Daily customers'
                value='42.4k'
                changePercentage={9.2}
                svg={<CustomersCardSvg />}
                className='shadow-none max-xl:col-span-full'
              />

              <TotalIncomeCard className='col-span-2 shadow-none' />

              <MonthlyCampaignCard
                title='Monthly campaign state'
                subTitle='7.58k Social Visitors'
                campaignData={campaignData}
                className='justify-between shadow-none max-sm:col-span-full md:max-lg:col-span-full'
              />

              <TotalEarningCard className='justify-between shadow-none max-sm:col-span-full md:max-lg:col-span-full [&>[data-slot=card-content]]:space-y-6' />

              <ForBusinessSharkCard className='shadow-none max-sm:col-span-full md:max-lg:col-span-full' />

              <VehiclesConditionCard
                title='Vehicles Condition'
                vehicleConditionData={vehicleConditionData}
                className='justify-between gap-6 shadow-none max-sm:col-span-full md:max-lg:col-span-full'
              />

              <Card className='col-span-full py-0 shadow-none'>
                <UserDatatable data={userData} />
              </Card>
            </div>
          </main>
          <footer>
            <div className='text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6'>
              <p className='text-sm text-balance max-sm:text-center'>
                {`©${new Date().getFullYear()}`} Made with ❤️ by CopyApes.
              </p>
              {/*<div className='flex items-center gap-5'>*/}
              {/*  <a href='#'>*/}
              {/*    <FacebookIcon className='size-4' />*/}
              {/*  </a>*/}
              {/*  <a href='#'>*/}
              {/*    <InstagramIcon className='size-4' />*/}
              {/*  </a>*/}
              {/*  <a href='#'>*/}
              {/*    <LinkedinIcon className='size-4' />*/}
              {/*  </a>*/}
              {/*  <a href='#'>*/}
              {/*    <TwitterIcon className='size-4' />*/}
              {/*  </a>*/}
              {/*</div>*/}
            </div>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default DashboardShell
