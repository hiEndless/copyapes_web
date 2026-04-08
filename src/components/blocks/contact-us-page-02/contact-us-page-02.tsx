import { MailIcon } from 'lucide-react'
import { IconBrandWechat, IconBrandTelegram } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'

import ContactForm from '@/components/blocks/contact-us-page-02/contact-form'
import { InViewBorderBeam } from '@/components/blocks/contact-us-page-02/in-view-border-beam'
import DottedSheet from '@/assets/svg/dotted-sheet'

const ContactUs = () => {
  const t = useTranslations('ContactUs')

  return (
    <section id='contact' className='relative z-1 [content-visibility:auto] py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>{t('title')}</h2>
          <p className='text-muted-foreground text-xl'>{t('subtitle')}</p>
        </div>

        <div className='relative overflow-hidden rounded-xl'>
          <InViewBorderBeam />
          <Card className='bg-background relative z-10 m-[1px] rounded-xl border shadow-none'>
            <CardContent className='grid gap-6 p-6 md:grid-cols-6'>
              <Card className='bg-primary py-8 shadow-none md:col-span-3 xl:col-span-2'>
                <CardContent className='text-primary-foreground space-y-7'>
                  <div className='space-y-2'>
                    <h2 className='text-2xl font-semibold'>{t('contact')}</h2>
                    <p>{t('desc')}</p>
                  </div>

                  <div className='space-y-7'>
                    {/* wx */}
                    <div className='flex items-start gap-4 text-lg font-semibold'>
                      <IconBrandWechat className='size-7 shrink-0' />
                      copyaped_admin
                    </div>

                    {/* Email */}
                    <div className='flex items-start gap-4'>
                      <MailIcon className='size-7 shrink-0' />
                      <a className='text-lg font-semibold' href='mailto:service@copyapes.com'>
                        service@copyapes.com
                      </a>
                    </div>

                    {/* tg */}
                    <div className='flex items-start gap-4 text-lg font-semibold'>
                      <IconBrandTelegram className='size-7 shrink-0' />
                      <a className='text-lg font-semibold' href='https://t.me/copyapes_admin'>
                        @copyapes_admin
                      </a>
                    </div>

                    <div className='flex items-start gap-4 text-lg font-semibold'>
                      <IconBrandTelegram className='size-7 shrink-0' />
                      <a className='text-lg font-semibold' href='https://t.me/copyapes_cn'>
                        {t('joinTg')}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Section */}
              <div className='md:col-span-3 xl:col-span-4'>
                <ContactForm />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DottedSheet className='pointer-events-none absolute inset-x-0 -z-1 mx-auto w-full max-w-7xl [contain:paint] px-4 max-sm:-top-1/2 sm:bottom-1/4 sm:px-6 lg:px-8' />
    </section>
  )
}

export default ContactUs
