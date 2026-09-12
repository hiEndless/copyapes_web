import { useEffect, useState, type ReactNode } from 'react'

import {
  SettingsIcon,
  LogOutIcon,
  MessageCircleWarning,
  Unplug,
  CrownIcon,
  Users,
  UserStar,
  Banknote,
  KeyRound,
  ListTodo,
  Timer
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { useRouter } from '@/i18n/routing'
import { type UserInfo } from '@/api/auth'
import { type EntitlementProfileResponse } from '@/api/settings'
import { remainingVipCapacityDays } from '@/lib/format-vip-capacity-expiry'

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
  const t = useTranslations('DashboardShell.profile')
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [profile, setProfile] = useState<EntitlementProfileResponse | null>(null)

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo')

      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo))
      }

      const storedProfile = localStorage.getItem('entitlementProfile')

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile))
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

    const handleProfileUpdate = () => {
      const stored = localStorage.getItem('entitlementProfile')

      if (stored) {
        setProfile(JSON.parse(stored))
      }
    }

    window.addEventListener('userInfoUpdated', handleUserInfoUpdate)
    window.addEventListener('entitlementProfileUpdated', handleProfileUpdate)

    return () => {
      window.removeEventListener('userInfoUpdated', handleUserInfoUpdate)
      window.removeEventListener('entitlementProfileUpdated', handleProfileUpdate)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('entitlementProfile')
    document.cookie = 'token=; path=/; max-age=0;'
    toast.success(t('logoutSuccess'))
    router.push('/login')
  }

  const vipCapacityRemainingDays = remainingVipCapacityDays(profile?.vip_capacity_expires_at)
  const temporaryRemainingDays = remainingVipCapacityDays(profile?.temporary_entitlement_expires_at)
  const temporaryActive =
    Boolean(profile?.temporary_entitlement_active) &&
    temporaryRemainingDays != null &&
    ((profile?.temporary_api_slots_delta ?? 0) > 0 ||
      (profile?.temporary_leader_api_slots_delta ?? 0) > 0 ||
      (profile?.temporary_task_slots_delta ?? 0) > 0)

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
            <span className='text-foreground text-sm font-semibold'>{userInfo?.name || t('userFallback')}</span>
            <span className='text-muted-foreground text-xs'>UID: {userInfo?.uid || '--'}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {profile?.is_vip && (
          <DropdownMenuGroup>
            <DropdownMenuItem className='px-3 py-2 text-sm'>
              <CrownIcon className='mr-2 size-4 text-yellow-500' />
              <span className='text-yellow-600'>{t('vipDays', { days: profile?.vip_days ?? 0 })}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {profile?.is_studio_vip && (
          <DropdownMenuGroup>
            <DropdownMenuItem className='px-3 py-2 text-sm'>
              <Users className='mr-2 size-4 text-purple-500' />
              <span className='text-purple-600'>{t('studioVipDays', { days: profile?.studio_vip_days ?? 0 })}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {vipCapacityRemainingDays != null && (
          <DropdownMenuGroup>
            <DropdownMenuItem className='px-3 py-2 text-sm'>
              <Timer className='mr-2 size-4 text-emerald-500' />
              <span className='text-emerald-700 dark:text-emerald-400'>
                {t('vipApiBoostExpires', { days: vipCapacityRemainingDays })}
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {temporaryActive && temporaryRemainingDays != null && (
          <DropdownMenuGroup>
            <DropdownMenuItem className='px-3 py-2 text-sm items-start'>
              <Timer className='mt-0.5 mr-2 size-4 shrink-0 text-sky-500' />
              <div className='flex min-w-0 flex-col gap-0.5'>
                <span className='text-sky-700 dark:text-sky-400'>
                  {t('temporaryGrantExpires', { days: temporaryRemainingDays })}
                </span>
                <span className='text-muted-foreground text-xs'>
                  {t('temporaryGrantDetail', {
                    api: profile?.temporary_api_slots_delta ?? 0,
                    leader: profile?.temporary_leader_api_slots_delta ?? 0,
                    task: profile?.temporary_task_slots_delta ?? 0,
                  })}
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {userInfo?.is_partner && (
          <DropdownMenuGroup>
            <DropdownMenuItem className='px-3 py-2 text-sm'>
              <UserStar className='mr-2 size-4 text-blue-500' />
              <span className='text-blue-600'>{t('partner')}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {!profile?.is_vip && !profile?.is_studio_vip && !userInfo?.is_partner && (
          <DropdownMenuGroup>
            <DropdownMenuItem className='px-3 py-2 text-sm'>
              <span className='text-muted-foreground'>{t('freeUser')}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-3 py-2 text-sm flex-col items-start gap-1'>
            <div className='flex w-full items-center'>
              <Banknote className='text-muted-foreground mr-2 size-4' />
              <span className='text-muted-foreground flex-1'>{t('assetLimit')}</span>
              <span className='text-foreground font-medium'>{profile?.asset_limit_usdt?.toLocaleString() ?? 0} USDT</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className='px-3 py-2 text-sm flex-col items-start gap-1'>
            <div className='flex w-full items-center'>
              <KeyRound className='text-muted-foreground mr-2 size-4' />
              <span className='text-muted-foreground flex-1'>{t('apiSlots')}</span>
              <span className='text-foreground font-medium'>
                {profile?.api_slot_used ?? 0} / {profile?.api_slot_limit ?? 0}
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className='px-3 py-2 text-sm flex-col items-start gap-1'>
            <div className='flex w-full items-center'>
              <UserStar className='text-muted-foreground mr-2 size-4' />
              <span className='text-muted-foreground flex-1'>{t('leaderApiSlots')}</span>
              <span className='text-foreground font-medium'>
                {profile?.leader_api_slot_used ?? 0} / {profile?.leader_api_slot_limit ?? 0}
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className='px-3 py-2 text-sm flex-col items-start gap-1'>
            <div className='flex w-full items-center'>
              <ListTodo className='text-muted-foreground mr-2 size-4' />
              <span className='text-muted-foreground flex-1'>{t('taskSlots')}</span>
              <span className='text-foreground font-medium'>
                {profile?.task_slot_used ?? 0} / {profile?.task_slot_limit ?? 0}
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='px-3 py-2 text-sm' onClick={() => router.push('/dashboard/pricing')}>
            <CrownIcon className='text-foreground mr-2 size-4' />
            <span>{t('pricing')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-3 py-2 text-sm' onClick={() => router.push('/dashboard/api')}>
            <Unplug className='text-foreground mr-2 size-4' />
            <span>{t('api')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-3 py-2 text-sm' onClick={() => router.push('/dashboard/account')}>
            <SettingsIcon className='text-foreground mr-2 size-4' />
            <span>{t('account')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-3 py-2 text-sm' onClick={() => router.push('/dashboard/notifications')}>
            <MessageCircleWarning className='text-foreground mr-2 size-4' />
            <span>{t('notifications')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant='destructive' className='px-3 py-2 text-sm' onClick={handleLogout}>
          <LogOutIcon className='mr-2 size-4' />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
