import type { ReactNode } from 'react'

export type TaskLogItem = {
  task_id?: string | number
  title?: string
  date?: string
  description?: string
  color?: string
  event_code?: string
  unique_name?: string
  inst_id?: string
  pos_side?: string
  signal_type?: string
  reason?: string
  has_structured_log?: boolean
  log_payload?: Record<string, unknown>
}

export type TaskParameterItem = {
  label: string
  value: ReactNode
}
