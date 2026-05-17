import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import { NO_INDEX_ROBOTS } from '@/lib/seo'

import DashboardShell from './dashboard-shell'

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS
}

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return <DashboardShell>{children}</DashboardShell>
}

export default DashboardLayout
