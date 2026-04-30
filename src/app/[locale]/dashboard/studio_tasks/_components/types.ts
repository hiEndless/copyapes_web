export type StudioTaskItem = {
  id: number
  uniqueName: string
  label?: string
  api_name: string
  investment?: string | number
  sums?: string | number
  status: number
  trader_platform: number
  role_type?: number
  create_datetime?: string
}

export type GroupedByTraderItem = {
  traderKey: string
  tasks: StudioTaskItem[]
  leadTask: StudioTaskItem
}

export type GroupedByApiItem = {
  apiName: string
  tasks: StudioTaskItem[]
}
