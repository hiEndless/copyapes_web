import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ locale: string }>
}

const LegacyCostRedirectPage = async ({ params }: PageProps) => {
  const { locale } = await params
  const prefix = locale === 'en' ? '' : `/${locale}`

  redirect(`${prefix}/incubator/dashboard/history`)
}

export default LegacyCostRedirectPage
