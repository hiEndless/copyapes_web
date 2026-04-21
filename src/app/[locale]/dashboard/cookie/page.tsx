'use client'

import { useState, useEffect } from 'react'

import { Plus, Cookie, Chrome, Upload, ShieldCheck, HelpCircle, AlertCircle, Edit2, Clock } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import { getCookies, addOrUpdateCookie, updateCookieName } from '@/api/cookie'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  curl_id: string | number
  curl_name: string
  exchange: number | string
  available: boolean
  updated_at: string
}

export default function CookiePage() {
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newPlatform, setNewPlatform] = useState('2') // 2: 币安, 1: 欧易
  const [newCookie, setNewCookie] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Edit Name State
  const [isEditNameOpen, setIsEditNameOpen] = useState(false)
  const [editingCookie, setEditingCookie] = useState<CookieItem | null>(null)
  const [newCookieName, setNewCookieName] = useState('')

  const fetchCookies = async () => {
    setIsLoading(true)

    try {
      const res = await getCookies()

      if (res.code === 0 && Array.isArray(res.data)) {
        setCookies(res.data)
      } else {
        toast.error(res.error || '获取数据失败')
      }
    } catch (e) {
      console.error(e)
      toast.error('暂无数据')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCookies()
  }, [])

  const handleUpload = async () => {
    if (!newCookie) return

    setIsLoading(true)

    try {
      const res = await addOrUpdateCookie({
        exchange: newPlatform,
        curl_text: newCookie
      })

      if (res.code === 0) {
        toast.success('上传成功')
        setNewCookie('')
        setIsUploadOpen(false)
        fetchCookies()
      } else {
        // toast is handled in request.ts, but we keep this branch
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditName = async () => {
    if (!editingCookie || !newCookieName) return

    setIsLoading(true)

    try {
      const res = await updateCookieName({
        curl_id: editingCookie.curl_id,
        curl_name: newCookieName
      })

      if (res.code === 0) {
        toast.success('修改成功')
        setIsEditNameOpen(false)
        setEditingCookie(null)
        setNewCookieName('')
        fetchCookies()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (cookie: CookieItem) => {
    setEditingCookie(cookie)
    setNewCookieName(cookie.curl_name || '')
    setIsEditNameOpen(true)
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
              下载 Chrome 插件
            </Button>
            <Accordion type='single' collapsible className='mt-4 w-full'>
              <AccordionItem value='how-to' className='border-none'>
                <AccordionTrigger className='text-primary py-2 text-sm hover:no-underline'>
                  <span className='flex items-center gap-1.5'>
                    <HelpCircle className='h-4 w-4' />
                    如何使用浏览器插件？
                  </span>
                </AccordionTrigger>
                <AccordionContent className='space-y-4 pt-2'>
                  <div className='text-muted-foreground space-y-2'>
                    <p className='text-foreground font-medium mt-2'>使用教程：</p>
                    <ol className='space-y-2 text-sm'>
                      <li>
                        ① 插件安装：
                        <a href='https://xwvmohge80.feishu.cn/docx/OWvbdwKKvo4qpXxRVOAcg40mnub?from=from_copylink' className='text-primary hover:underline' target='_blank'>
                          如何安装使用Chrome浏览器插件
                        </a>
                      </li>
                      <li>② 将插件固定在浏览器上，打开插件，登录跟单猿账号</li>
                      <li>
                        ③
                        打开官网，登录交易所跟单的账号，随便点击进入一个跟单项目，等待页面加载完成后，插件会自动抓取Cookie信息并提交，你可在本页面进行查看提交信息
                      </li>
                      <li>④ 你也可以在插件中点击刷新数据按钮，手动刷新获取Cookie信息</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                        <SelectItem value='2'>Binance (币安)</SelectItem>
                        <SelectItem value='1'>OKX (欧易)</SelectItem>
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
              <Card
                key={cookie.curl_id}
                className='group relative flex flex-col overflow-hidden border-border/50 bg-gradient-to-b from-background to-muted/20 shadow-sm transition-all hover:border-primary/20 hover:shadow-md'
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 w-full ${
                    cookie.available ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
                  }`}
                />
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <img
                        src={`/exchanges/${String(cookie.exchange) === '2' ? 'binance' : 'okx'}.png`}
                        alt={String(cookie.exchange) === '2' ? 'Binance' : 'OKX'}
                        className='h-6 w-6 object-contain'
                      />
                      <div className='flex flex-col gap-1'>
                        <CardTitle className='text-sm font-semibold tracking-tight'>
                          {cookie.curl_name || (String(cookie.exchange) === '2' ? 'Binance (币安)' : 'OKX (欧易)')}
                        </CardTitle>
                        <Badge
                          variant='secondary'
                          className={`w-fit px-1.5 py-0 text-[9px] font-medium ${
                            cookie.available
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                          }`}
                        >
                          {cookie.available ? '生效中' : '已失效'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-primary/10 hover:text-primary group-hover:opacity-100'
                      onClick={() => openEditDialog(cookie)}
                    >
                      <Edit2 className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='mt-auto'>
                  <div className='flex items-center gap-1.5 text-[10px] text-muted-foreground'>
                    <Clock className='h-3 w-3' />
                    <span>最后更新: {cookie.updated_at}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>修改名称</DialogTitle>
            <DialogDescription>
              自定义一个独特名字，便于自己和他人搜索使用。更改名字不会影响正在进行中的跟单。
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='cookieName'>Cookie 名称</Label>
              <Input
                id='cookieName'
                placeholder='输入修改的名字'
                value={newCookieName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCookieName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditNameOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditName} disabled={!newCookieName || isLoading}>
              {isLoading ? '保存中...' : '确认修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
