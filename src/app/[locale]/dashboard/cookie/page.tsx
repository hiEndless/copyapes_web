'use client'

import { useState } from 'react'

import { Plus, Cookie, Chrome, Upload, Trash2, ShieldCheck, Download, HelpCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type CookieItem = {
  id: string
  platform: string
  cookieStr: string
  updatedAt: string
}

export default function CookiePage() {
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newPlatform, setNewPlatform] = useState('binance')
  const [newCookie, setNewCookie] = useState('')

  const handleUpload = () => {
    if (!newCookie) return

    const newItem: CookieItem = {
      id: Math.random().toString(36).substring(7),
      platform: newPlatform,
      cookieStr: newCookie,
      updatedAt: new Date().toLocaleString()
    }

    setCookies([...cookies, newItem])
    setNewCookie('')
    setIsUploadOpen(false)
  }

  const handleDelete = (id: string) => {
    setCookies(cookies.filter(c => c.id !== id))
  }

  const handleCookieChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    // Auto-extract cookie from cURL command
    if (value.trim().startsWith('curl') || value.includes('-H')) {
      // match -H 'cookie: ...' or -H "cookie: ..."
      const match = value.match(/-H\s+(['"])[cC]ookie:\s*(.*?)\1/)

      if (match && match[2]) {
        setNewCookie(match[2])

        return
      }

      // fallback for unquoted or differently formatted cookies
      const unquotedMatch = value.match(/-H\s+[cC]ookie:\s*(\S+)/)

      if (unquotedMatch && unquotedMatch[1]) {
        setNewCookie(unquotedMatch[1])

        return
      }
    }

    setNewCookie(value)
  }

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>Cookie 管理</h2>
        <p className='text-muted-foreground text-sm'>
          通过绑定交易所 Cookie，您可以解锁更多受限接口的功能，如获取带单员私有数据等。
        </p>
        <Alert className='border-primary/20 bg-primary/5 text-primary mt-2'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle className='font-semibold'>Cookie 提交说明</AlertTitle>
          <AlertDescription className='text-sm'>
            每个交易所平台只能绑定一个 Cookie 信息。如果您需要绑定同一个交易所的多个
            Cookie，可以免费注册多个本平台账号进行添加和使用。
          </AlertDescription>
        </Alert>
      </div>

      {/* 获取 Cookie 的方式 */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='shadow-sm'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg'>
                <Chrome className='text-primary h-5 w-5' />
              </div>
              <CardTitle className='text-lg'>浏览器插件自动获取</CardTitle>
            </div>
            <CardDescription>
              推荐方式。安装我们的 Chrome 浏览器插件，登录交易所后自动获取并同步 Cookie，安全便捷。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='text-muted-foreground mb-4 space-y-2 text-sm'>
              <li className='flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-green-500' /> 仅在本地运行，数据加密传输
              </li>
              <li className='flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-green-500' /> 支持自动保活和更新
              </li>
            </ul>
            <Button className='w-full sm:w-auto' variant='secondary'>
              <Download className='mr-2 h-4 w-4' />
              下载 Chrome 插件
            </Button>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg'>
                <Upload className='text-primary h-5 w-5' />
              </div>
              <CardTitle className='text-lg'>手动上传 Cookie</CardTitle>
            </div>
            <CardDescription>适合高级用户。在浏览器开发者工具中提取 Cookie 字符串并手动粘贴上传。</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='text-muted-foreground mb-4 space-y-2 text-sm'>
              <li className='flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-green-500' /> 适合无法安装插件的环境
              </li>
              <li className='flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-yellow-500' /> 需要定期手动更新过期 Cookie
              </li>
            </ul>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className='w-full sm:w-auto' variant='outline'>
                  <Plus className='mr-2 h-4 w-4' />
                  手动上传
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>手动上传 Cookie</DialogTitle>
                  <DialogDescription>请选择对应的交易所，并粘贴您获取到的完整 Cookie 字符串。</DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='platform'>交易所平台</Label>
                    <Select value={newPlatform} onValueChange={setNewPlatform}>
                      <SelectTrigger id='platform'>
                        <SelectValue placeholder='选择交易所' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='binance'>Binance (币安)</SelectItem>
                        <SelectItem value='okx'>OKX (欧易)</SelectItem>
                        <SelectItem value='bitget'>Bitget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='cookie'>Cookie 字符串</Label>
                    <Textarea
                      id='cookie'
                      placeholder='粘贴类似于 "lang=zh-CN; session_id=..." 的内容，或者直接粘贴包含 Cookie 的 cURL 命令，系统会自动提取。'
                      className='h-32 resize-none'
                      value={newCookie}
                      onChange={handleCookieChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant='outline' onClick={() => setIsUploadOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleUpload} disabled={!newCookie}>
                    保存上传
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Accordion type='single' collapsible className='mt-4 w-full'>
              <AccordionItem value='how-to' className='border-none'>
                <AccordionTrigger className='text-primary py-2 text-sm hover:no-underline'>
                  <span className='flex items-center gap-1.5'>
                    <HelpCircle className='h-4 w-4' />
                    如何手动获取 Cookie？
                  </span>
                </AccordionTrigger>
                <AccordionContent className='space-y-4 pt-2'>
                  <div className='text-muted-foreground space-y-2'>
                    <p className='text-foreground font-medium'>在Chrome浏览器中复制cURL命令，可以按照以下步骤操作：</p>
                    <ol className='list-decimal space-y-1.5 pl-5'>
                      <li>打开Chrome开发者工具（按F12），然后刷新网页</li>
                      <li>
                        <strong>币安</strong>在“网络”面板中找到请求：
                        <code className='bg-muted rounded px-1 py-0.5'>positions?portfolioId=xxxxx</code>
                        ，xxxxx为跟单的项目id
                      </li>
                      <li>
                        <strong>欧易</strong>(合约带单&gt;当前带单)在“网络”面板中找到请求：
                        <code className='bg-muted rounded px-1 py-0.5'>
                          position-detail?instType=SWAP&amp;uniqueName=xxxxx
                        </code>
                        ，xxxxx为跟单的项目id
                      </li>
                      <li>右键点击该请求，选择“复制” -&gt; “以cURL格式复制”</li>
                      <li>将请求的cURL命令复制到剪贴板，然后在上方文本框中粘贴。</li>
                    </ol>
                    <p className='mt-2 text-xs'>此方法也适用于其他浏览器</p>
                  </div>

                  <div className='overflow-hidden rounded-md border'>
                    <Image
                      src='/images/cookie.png'
                      alt='获取 Cookie 示例图'
                      width={800}
                      height={400}
                      className='h-auto w-full object-cover'
                    />
                  </div>

                  <Alert variant='destructive' className='mt-4 py-2'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle className='text-sm font-semibold'>警告</AlertTitle>
                    <AlertDescription className='text-xs'>
                      请勿将此信息透露给其他人，以免造成资产损失。
                    </AlertDescription>
                  </Alert>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className='mt-4 flex flex-col gap-4'>
        <h3 className='text-lg font-semibold'>我的交易所 Cookie</h3>

        {cookies.length === 0 ? (
          <div className='animate-in fade-in-50 flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center'>
            <div className='bg-muted flex h-20 w-20 items-center justify-center rounded-full'>
              <Cookie className='text-muted-foreground h-10 w-10' />
            </div>
            <h3 className='mt-4 text-lg font-semibold'>暂无 Cookie 数据</h3>
            <p className='text-muted-foreground mt-2 mb-6 max-w-sm text-sm'>
              您还没有绑定任何交易所的 Cookie，请通过上方浏览器插件或手动上传来获取并绑定。
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              立即上传
            </Button>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {cookies.map(cookie => (
              <Card key={cookie.id} className='relative overflow-hidden shadow-sm'>
                <div className='absolute top-0 right-0 h-2 w-full bg-green-500/80'></div>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='flex items-center gap-2 text-lg capitalize'>
                      {cookie.platform}
                      <Badge
                        variant='outline'
                        className='border-green-200 bg-green-50 text-xs font-normal text-green-600 dark:border-green-900 dark:bg-green-950/20 dark:text-green-400'
                      >
                        生效中
                      </Badge>
                    </CardTitle>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-muted-foreground hover:text-destructive h-8 w-8'
                      onClick={() => handleDelete(cookie.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                  <CardDescription className='text-xs'>最后更新: {cookie.updatedAt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='bg-muted rounded-md p-3'>
                    <p className='text-muted-foreground truncate font-mono text-xs'>{cookie.cookieStr}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
