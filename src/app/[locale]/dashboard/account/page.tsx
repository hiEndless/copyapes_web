'use client'

import { useCallback, useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { authApi, type UserInfo } from '@/api/auth'
import { request } from '@/api/request'
import { EmailChangeCard } from './_components/email-change-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const settingTabs = [
  {
    value: 'account',
    label: '账户信息',
    title: '账户信息',
    description: '修改用户名与绑定邮箱。',
  },
  {
    value: 'password',
    label: '修改密码',
    title: '修改密码',
    description: '定期修改密码以保护您的账户安全。',
  },
] as const

const persistUserInfo = (next: UserInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(next))
  window.dispatchEvent(new Event('userInfoUpdated'))
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<(typeof settingTabs)[number]['value']>('account')
  const activeTabMeta = settingTabs.find(tab => tab.value === activeTab) ?? settingTabs[0]

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
      toast.error('新密码与确认密码不一致')
      return
    }

    if (pwdForm.newPassword.length < 6) {
      toast.error('新密码长度不能少于 6 位')
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
      toast.error('请输入新用户名')
      return
    }
    setUsernameLoading(true)
    try {
      const res = await authApi.patchUsername({
        new_username: usernameNew.trim(),
        password: usernamePassword,
      })
      if (res.code === 0 && res.data?.name && userInfo) {
        toast.success('用户名已更新')
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
        <h1 className='text-2xl font-semibold tracking-tight'>账户设置</h1>
        <p className='text-muted-foreground text-sm'>管理您的个人账户信息与安全设置</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as (typeof settingTabs)[number]['value'])}
        orientation='vertical'
        className='flex min-h-0 flex-col gap-4 md:flex-row md:gap-6'
      >
        <TabsList className='bg-background h-fit w-full justify-start gap-1 overflow-x-auto rounded-xl border p-1.5 sm:p-2 md:max-w-[220px] md:flex-col md:overflow-visible'>
          {settingTabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className='min-w-fit flex-none justify-center rounded-lg px-3 py-2 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none dark:data-[state=active]:border-transparent md:w-full md:justify-start md:px-4 md:py-3 md:text-left'
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className='min-w-0 flex-1'>
          <div className='mb-4 space-y-1 px-1 md:px-0'>
            <h2 className='text-lg font-semibold'>{activeTabMeta.title}</h2>
            <p className='text-muted-foreground text-sm'>{activeTabMeta.description}</p>
          </div>

          <TabsContent value='account' className='mt-0 space-y-6'>
            <Card className='shadow-sm'>
              <CardHeader>
                <CardTitle>修改用户名</CardTitle>
                <CardDescription>
                  当前用户名：<span className='text-foreground font-medium'>{userInfo?.name ?? '—'}</span>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUsernameSubmit}>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='newUsername'>新用户名</Label>
                    <Input
                      id='newUsername'
                      type='text'
                      autoComplete='username'
                      placeholder='至少 5 位，字母数字及 @ _ . -'
                      value={usernameNew}
                      onChange={e => setUsernameNew(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='usernamePassword'>当前密码</Label>
                    <Input
                      id='usernamePassword'
                      type='password'
                      autoComplete='current-password'
                      placeholder='用于确认身份'
                      value={usernamePassword}
                      onChange={e => setUsernamePassword(e.target.value)}
                    />
                  </div>
                  <Button type='submit' disabled={usernameLoading} className='w-full'>
                    {usernameLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    {usernameLoading ? '保存中...' : '保存用户名'}
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
                  toast.success('邮箱已更新')
                }}
              />
            ) : null}
          </TabsContent>

          <TabsContent value='password' className='mt-0'>
            <Card className='shadow-sm'>
              <CardHeader>
                <CardTitle>修改密码</CardTitle>
                <CardDescription>新密码长度不能少于 6 个字符。</CardDescription>
              </CardHeader>
              <form onSubmit={handlePwdSubmit}>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='oldPassword'>原密码</Label>
                    <Input
                      id='oldPassword'
                      name='oldPassword'
                      type='password'
                      placeholder='请输入当前使用的密码'
                      required
                      value={pwdForm.oldPassword}
                      onChange={handlePwdChange}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='newPassword'>新密码</Label>
                    <Input
                      id='newPassword'
                      name='newPassword'
                      type='password'
                      placeholder='请输入新密码'
                      required
                      value={pwdForm.newPassword}
                      onChange={handlePwdChange}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>确认新密码</Label>
                    <Input
                      id='confirmPassword'
                      name='confirmPassword'
                      type='password'
                      placeholder='请再次输入新密码'
                      required
                      value={pwdForm.confirmPassword}
                      onChange={handlePwdChange}
                    />
                  </div>
                  <div className='space-y-2 pt-2'>
                    <Button type='submit' disabled={pwdLoading} className='w-full'>
                      {pwdLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                      {pwdLoading ? '正在保存...' : '保存修改'}
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
