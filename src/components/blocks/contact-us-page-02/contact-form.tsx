'use client'

import { SendIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const ContactForm = () => {
  return (
    <form className='space-y-6' onSubmit={e => e.preventDefault()}>
      <div className='flex w-full flex-wrap gap-6'>
        {/* Name Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='name'>如何称呼您</Label>
          <Input type='text' id='name' className='h-10' placeholder='您的称呼...' />
        </div>

        {/* Email Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='email'>您的联系方式</Label>
          <Input type='text' id='contact' className='h-10' placeholder='输入您的联系方式......' />
        </div>
      </div>

      {/* Subject Input */}
      {/*<div className='w-full space-y-2'>*/}
      {/*  <Label htmlFor='subject'>Your Subject</Label>*/}
      {/*  <Input type='text' id='subject' className='h-10' placeholder='Enter your subject here...' />*/}
      {/*</div>*/}

      {/* Message Input */}
      <div className='space-y-2'>
        <Label htmlFor='message'>留言信息</Label>
        <Textarea
          id='message'
          className='h-48 resize-none'
          placeholder='在这里写下你的留言，我们将第一时间联系你！欢迎媒体、KOL、交易员、私域群主等等前来洽谈合作！'
        />
      </div>

      {/* Submit Button */}
      <Button type='submit' size='lg' className='rounded-lg text-base has-[>svg]:px-6'>
        发送信息
        <SendIcon />
      </Button>
    </form>
  )
}

export default ContactForm
