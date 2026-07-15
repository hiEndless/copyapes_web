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

export type TaskPositionItem = {
  instId: string
  raw_symbol?: string
  mgnMode?: string
  posSide?: string
  side?: string
  leader_pos: string
  follow_pos: string
  leader_position?: Record<string, unknown>
  follow_position?: Record<string, unknown>
}

export type TaskPositionSummary = {
  positions: TaskPositionItem[]
  follow_only_positions: TaskPositionItem[]
  leader_snapshot_found?: boolean
  follow_ledger_found?: boolean
  leader_snapshot_saved_at_ms?: number | null
}
