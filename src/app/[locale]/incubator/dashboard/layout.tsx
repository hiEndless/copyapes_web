import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import IncubatorAccessGuard from '@/components/dashboard/incubator-access-guard'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

import DashboardShell from '../../dashboard/dashboard-shell'

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS
}

const IncubatorDashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <DashboardShell system='incubator'>
      <IncubatorAccessGuard>{children}</IncubatorAccessGuard>
    </DashboardShell>
  )
}

export default IncubatorDashboardLayout
