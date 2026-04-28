'use client'

import { useState } from 'react'
import { SendIcon, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { settingsApi } from '@/api/settings'

const ContactForm = () => {
  const t = useTranslations('ContactForm')

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.contact.trim() || !formData.message.trim()) {
      return
    }

    try {
      setLoading(true)
      const res = await settingsApi.sendMessage({
        full_name: formData.name,
        connect: formData.contact,
        message: formData.message
      })

      if (res.code === 0) {
        toast.success(t('success'))
        setFormData({ name: '', contact: '', message: '' })
      }
    } catch (error) {
      // Error is handled by request interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      <div className='flex w-full flex-wrap gap-6'>
        {/* Name Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='name'>{t('name')}</Label>
          <Input 
            type='text' 
            id='name' 
            className='h-10' 
            placeholder={t('namePlaceholder')} 
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        {/* Email Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='contact'>{t('contact')}</Label>
          <Input 
            type='text' 
            id='contact' 
            className='h-10' 
            placeholder={t('contactPlaceholder')} 
            value={formData.contact}
            onChange={e => setFormData(prev => ({ ...prev, contact: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* Message Input */}
      <div className='space-y-2'>
        <Label htmlFor='message'>{t('message')}</Label>
        <Textarea
          id='message'
          className='h-48 resize-none'
          placeholder={t('messagePlaceholder')}
          value={formData.message}
          onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
          required
        />
      </div>

      {/* Submit Button */}
      <Button type='submit' size='lg' className='rounded-lg text-base has-[>svg]:px-6' disabled={loading}>
        {loading ? t('sending') : t('submit')}
        {loading ? <Loader2 className='animate-spin' /> : <SendIcon />}
      </Button>
    </form>
  )
}

export default ContactForm
