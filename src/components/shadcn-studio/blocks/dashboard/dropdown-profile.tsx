import { useEffect, useState, type ReactNode } from 'react'

import {
  SettingsIcon,
  LogOutIcon,
  MessageCircleWarning,
  Unplug,
  DollarSignIcon,
  CrownIcon,
  Users,
  UserStar
} from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from '@/i18n/routing'
import { type UserInfo } from '@/api/auth'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const ProfileDropdown = ({ trigger, defaultOpen, align = 'end' }: Props) => {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userInfo')

      if (stored) {
        setUserInfo(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }

    const handleUserInfoUpdate = () => {
      const stored = localStorage.getItem('userInfo')

      if (stored) {
        setUserInfo(JSON.parse(stored))
      }
    }

    window.addEventListener('userInfoUpdated', handleUserInfoUpdate)

    return () => {
      window.removeEventListener('userInfoUpdated', handleUserInfoUpdate)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    document.cookie = 'token=; path=/; max-age=0;'
    toast.success('已退出登录')
    router.push('/login')
  }

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='w-64' align={align || 'end'}>
        <DropdownMenuLabel className='flex items-center gap-3 px-3 py-2 font-normal'>
          <div className='relative'>
            <Avatar className='size-8'>
              <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
              <AvatarFallback>{userInfo?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
          </div>
          <div className='flex flex-1 flex-col items-start'>
            <span className='text-foreground text-sm font-semibold'>{userInfo?.name || '用户'}</span>
            <span className='text-muted-foreground text-xs'>UID: {userInfo?.id || '--'}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {userInfo?.is_vip && (
          <DropdownMenuGroup>
            <DropdownMenuItem className='px-3 py-2 text-sm'>
              <CrownIcon className='mr-2 size-4 text-yellow-500' />
              <span className='text-yellow-600'>VIP 剩余 {userInfo.vip_days ?? 0} 天</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {userInfo?.is_studio_vip && (
          <DropdownMenuGroup>
            <DropdownMenuItem className='px-3 py-2 text-sm'>
              <Users className='mr-2 size-4 text-purple-500' />
              <span className='text-purple-600'>工作室 VIP 剩余 {userInfo.studio_vip_days ?? 0} 天</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {userInfo?.is_partner && (
          <DropdownMenuGroup>
            <DropdownMenuItem className='px-3 py-2 text-sm'>
              <UserStar className='mr-2 size-4 text-blue-500' />
              <span className='text-blue-600'>代理合作伙伴</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {(userInfo?.is_vip || userInfo?.is_studio_vip || userInfo?.is_partner) && <DropdownMenuSeparator />}
        <DropdownMenuGroup>
          <DropdownMenuItem className='px-3 py-2 text-sm' onClick={() => router.push('/dashboard/pricing')}>
            <DollarSignIcon className='text-foreground mr-2 size-4' />
            <span>订阅服务</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-3 py-2 text-sm' onClick={() => router.push('/dashboard/api')}>
            <Unplug className='text-foreground mr-2 size-4' />
            <span>API 管理</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-3 py-2 text-sm' onClick={() => router.push('/dashboard/account')}>
            <SettingsIcon className='text-foreground mr-2 size-4' />
            <span>账户设置</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-3 py-2 text-sm' onClick={() => router.push('/dashboard/notifications')}>
            <MessageCircleWarning className='text-foreground mr-2 size-4' />
            <span>消息通知</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant='destructive' className='px-3 py-2 text-sm' onClick={handleLogout}>
          <LogOutIcon className='mr-2 size-4' />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
