'use client'

import { SendIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const ContactForm = () => {
  const t = useTranslations('ContactForm')

  return (
    <form className='space-y-6' onSubmit={e => e.preventDefault()}>
      <div className='flex w-full flex-wrap gap-6'>
        {/* Name Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='name'>{t('name')}</Label>
          <Input type='text' id='name' className='h-10' placeholder={t('namePlaceholder')} />
        </div>

        {/* Email Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='email'>{t('contact')}</Label>
          <Input type='text' id='contact' className='h-10' placeholder={t('contactPlaceholder')} />
        </div>
      </div>

      {/* Subject Input */}
      {/*<div className='w-full space-y-2'>*/}
      {/*  <Label htmlFor='subject'>Your Subject</Label>*/}
      {/*  <Input type='text' id='subject' className='h-10' placeholder='Enter your subject here...' />*/}
      {/*</div>*/}

      {/* Message Input */}
      <div className='space-y-2'>
        <Label htmlFor='message'>{t('message')}</Label>
        <Textarea
          id='message'
          className='h-48 resize-none'
          placeholder={t('messagePlaceholder')}
        />
      </div>

      {/* Submit Button */}
      <Button type='submit' size='lg' className='rounded-lg text-base has-[>svg]:px-6'>
        {t('submit')}
        <SendIcon />
      </Button>
    </form>
  )
}

export default ContactForm
