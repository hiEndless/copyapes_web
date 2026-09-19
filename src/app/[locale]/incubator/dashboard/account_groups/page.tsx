import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ locale: string }>
}

const LegacyAccountGroupsRedirectPage = async ({ params }: PageProps) => {
  const { locale } = await params
  const prefix = locale === 'en' ? '' : `/${locale}`

  redirect(`${prefix}/incubator/dashboard/board`)
}

export default LegacyAccountGroupsRedirectPage
