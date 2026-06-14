export type StudioTaskItem = {
  id: number
  uniqueName: string
  label?: string
  api_id: number
  api_name: string
  api_platform?: number | string
  investment?: string | number
  sums?: string | number
  status: number
  trader_platform: number
  role_type?: number
  create_datetime?: string
  create_ts_ms?: number | string | null
}

export type GroupedByTraderItem = {
  traderKey: string
  tasks: StudioTaskItem[]
  leadTask: StudioTaskItem
}

export type GroupedByApiItem = {
  apiId: number
  apiName: string
  exchangeName: string
  tasks: StudioTaskItem[]
}
