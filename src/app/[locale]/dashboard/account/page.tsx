'use client'

import { useState } from 'react'

import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { request } from '@/api/request'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function AccountPage() {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('新密码与确认密码不一致')

      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('新密码长度不能少于 6 位')

      return
    }

    setLoading(true)

    try {
      const response = await request('/changepassword/', {
        method: 'POST',
        body: {
          password: formData.oldPassword,
          new_password: formData.newPassword,
          confirm_password: formData.confirmPassword
        }
      })

      if (response.code === 0) {
        toast.success('密码修改成功')
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>账号设置</h2>
        <p className='text-muted-foreground text-sm'>管理您的个人账户信息与安全设置</p>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>定期修改密码以保护您的账户安全。新密码长度不能少于 6 个字符。</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='oldPassword'>原密码</Label>
                <Input
                  id='oldPassword'
                  name='oldPassword'
                  type='password'
                  placeholder='请输入当前使用的密码'
                  required
                  value={formData.oldPassword}
                  onChange={handleChange}
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
                  value={formData.newPassword}
                  onChange={handleChange}
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <div className='space-y-2 pt-2'>
                <Button type='submit' disabled={loading} className='w-full'>
                  {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {loading ? '正在保存...' : '保存修改'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
