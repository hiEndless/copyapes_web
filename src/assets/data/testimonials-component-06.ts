import { useTranslations } from 'next-intl'

export type TestimonialItem = {
  name: string
  role: string
  avatar: string
  content: string
}

export const useTestimonials = (): TestimonialItem[] => {
  const t = useTranslations('TestimonialsData')
  
  return [
    {
      name: 'Paityn Lipshutz',
      role: 'CEO & Co Founder at Lemonsqueezy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiMing',
      content: t('1')
    },
    {
      name: 'Angel Lubin',
      role: 'CEO & Co Founder at Zipline',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoMin',
      content: t('2')
    },
    {
      name: 'Lincoln Stanton',
      role: 'CEO & Co Founder at Gumroad',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wukong',
      content: t('3')
    },
    {
      name: 'Skylar Lipshutz',
      role: 'Product manager at Orbit',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WuPeng',
      content: t('4')
    },
    {
      name: 'Corey Franci',
      role: 'sbaker@hotmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangWei',
      content: t('5')
    },
    {
      name: 'Anika Franci',
      role: 'CEO & Co Founder at Zendesk',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sheikh',
      content: t('6')
    },
    {
      name: 'Skylar Rosser',
      role: 'Product manager at Orbit',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunHao',
      content: t('7')
    },
    {
      name: 'Chance Baptista',
      role: 'CEO & Co Founder at ABC Company',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=XP',
      content: t('8')
    }
  ]
}
