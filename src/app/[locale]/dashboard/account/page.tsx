'use client'

import { useCallback, useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { authApi, type UserInfo } from '@/api/auth'
import { request } from '@/api/request'
import { EmailChangeCard } from './_components/email-change-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const settingTabValues = ['account', 'password'] as const

const persistUserInfo = (next: UserInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(next))
  window.dispatchEvent(new Event('userInfoUpdated'))
}

export default function AccountPage() {
  const t = useTranslations('DashboardAccount')
  const [activeTab, setActiveTab] = useState<(typeof settingTabValues)[number]>('account')

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  const [usernameNew, setUsernameNew] = useState('')
  const [usernamePassword, setUsernamePassword] = useState('')
  const [usernameLoading, setUsernameLoading] = useState(false)

  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdForm, setPwdForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const refreshUser = useCallback(async () => {
    try {
      const raw = localStorage.getItem('userInfo')
      const fromStorage = raw ? (JSON.parse(raw) as UserInfo) : null
      const tokenLs = localStorage.getItem('token') || ''
      const res = await authApi.getLoginInfo()
      if (res.code === 0 && res.data) {
        const merged: UserInfo = {
          ...(fromStorage ?? ({} as UserInfo)),
          ...res.data,
          token: tokenLs || fromStorage?.token || '',
        }
        setUserInfo(merged)
        if (tokenLs) {
          persistUserInfo(merged)
        }
        return
      }
      if (fromStorage) {
        setUserInfo(fromStorage)
      }
    } catch {
      const raw = localStorage.getItem('userInfo')
      if (raw) {
        setUserInfo(JSON.parse(raw) as UserInfo)
      }
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwdForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error(t('password.mismatch'))
      return
    }

    if (pwdForm.newPassword.length < 6) {
      toast.error(t('password.tooShort'))
      return
    }

    setPwdLoading(true)

    try {
      const response = await request('/changepassword/', {
        method: 'POST',
        body: {
          password: pwdForm.oldPassword,
          new_password: pwdForm.newPassword,
          confirm_password: pwdForm.confirmPassword,
        },
      })

      if (response.code === 0) {
        setPwdForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setPwdLoading(false)
    }
  }

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameNew.trim()) {
      toast.error(t('username.needUsername'))
      return
    }
    setUsernameLoading(true)
    try {
      const res = await authApi.patchUsername({
        new_username: usernameNew.trim(),
        password: usernamePassword,
      })
      if (res.code === 0 && res.data?.name && userInfo) {
        toast.success(t('username.updated'))
        const next = { ...userInfo, name: res.data.name }
        setUserInfo(next)
        persistUserInfo(next)
        setUsernameNew('')
        setUsernamePassword('')
      }
    } finally {
      setUsernameLoading(false)
    }
  }

  return (
    <div className='mx-auto flex h-full w-full max-w-6xl flex-col gap-5 overflow-y-auto p-4 sm:gap-6 sm:p-6'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>{t('page.title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('page.subtitle')}</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as (typeof settingTabValues)[number])}
        orientation='vertical'
        className='flex min-h-0 flex-col gap-4 md:flex-row md:gap-6'
      >
        <TabsList className='bg-background h-fit w-full justify-start gap-1 overflow-x-auto rounded-xl border p-1.5 sm:p-2 md:max-w-[220px] md:flex-col md:overflow-visible'>
          {settingTabValues.map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className='min-w-fit flex-none justify-center rounded-lg px-3 py-2 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none dark:data-[state=active]:border-transparent md:w-full md:justify-start md:px-4 md:py-3 md:text-left'
            >
              {t(`tabs.${tab}.label`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className='min-w-0 flex-1'>
          <div className='mb-4 space-y-1 px-1 md:px-0'>
            <h2 className='text-lg font-semibold'>{t(`tabs.${activeTab}.title`)}</h2>
            <p className='text-muted-foreground text-sm'>{t(`tabs.${activeTab}.description`)}</p>
          </div>

          <TabsContent value='account' className='mt-0 space-y-6'>
            <Card className='shadow-sm'>
              <CardHeader>
                <CardTitle>{t('username.title')}</CardTitle>
                <CardDescription>
                  {t('username.current', { name: userInfo?.name ?? '—' })}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUsernameSubmit}>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='newUsername'>{t('username.newLabel')}</Label>
                    <Input
                      id='newUsername'
                      type='text'
                      autoComplete='username'
                      placeholder={t('username.newPlaceholder')}
                      value={usernameNew}
                      onChange={e => setUsernameNew(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='usernamePassword'>{t('username.passwordLabel')}</Label>
                    <Input
                      id='usernamePassword'
                      type='password'
                      autoComplete='current-password'
                      placeholder={t('username.passwordPlaceholder')}
                      value={usernamePassword}
                      onChange={e => setUsernamePassword(e.target.value)}
                    />
                  </div>
                  <Button type='submit' disabled={usernameLoading} className='w-full'>
                    {usernameLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    {usernameLoading ? t('username.saving') : t('username.save')}
                  </Button>
                </CardContent>
              </form>
            </Card>

            {userInfo ? (
              <EmailChangeCard
                boundEmail={userInfo.email}
                onEmailUpdated={(email, emailVerified) => {
                  const next = { ...userInfo, email, email_verified: emailVerified }
                  setUserInfo(next)
                  persistUserInfo(next)
                  toast.success(t('email.updated'))
                }}
              />
            ) : null}
          </TabsContent>

          <TabsContent value='password' className='mt-0'>
            <Card className='shadow-sm'>
              <CardHeader>
                <CardTitle>{t('password.title')}</CardTitle>
                <CardDescription>{t('password.description')}</CardDescription>
              </CardHeader>
              <form onSubmit={handlePwdSubmit}>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='oldPassword'>{t('password.oldLabel')}</Label>
                    <Input
                      id='oldPassword'
                      name='oldPassword'
                      type='password'
                      placeholder={t('password.oldPlaceholder')}
                      required
                      value={pwdForm.oldPassword}
                      onChange={handlePwdChange}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='newPassword'>{t('password.newLabel')}</Label>
                    <Input
                      id='newPassword'
                      name='newPassword'
                      type='password'
                      placeholder={t('password.newPlaceholder')}
                      required
                      value={pwdForm.newPassword}
                      onChange={handlePwdChange}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>{t('password.confirmLabel')}</Label>
                    <Input
                      id='confirmPassword'
                      name='confirmPassword'
                      type='password'
                      placeholder={t('password.confirmPlaceholder')}
                      required
                      value={pwdForm.confirmPassword}
                      onChange={handlePwdChange}
                    />
                  </div>
                  <div className='space-y-2 pt-2'>
                    <Button type='submit' disabled={pwdLoading} className='w-full'>
                      {pwdLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                      {pwdLoading ? t('password.saving') : t('password.save')}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
