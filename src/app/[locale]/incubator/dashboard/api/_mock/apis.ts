export type ApiItem = {
  id: string
  platform: string
  api_name: string
  uid: string | null
  usdt: number | null
  create_datetime: string
  status: number
  roleType?: string | null
  flag?: 0 | 1
}

export const MOCK_API_LIST: ApiItem[] = [
  {
    id: '101',
    platform: 'binance',
    api_name: 'B11',
    uid: '88421001',
    usdt: 1250.4321,
    create_datetime: '2026-09-10 11:20:08',
    status: 1,
    roleType: null
  },
  {
    id: '102',
    platform: 'binance',
    api_name: 'B12',
    uid: '88421002',
    usdt: 980.12,
    create_datetime: '2026-09-11 09:05:41',
    status: 1,
    roleType: null
  },
  {
    id: '103',
    platform: 'binance',
    api_name: 'B13',
    uid: '88421003',
    usdt: 2105.8,
    create_datetime: '2026-09-12 16:44:19',
    status: 1,
    roleType: 'leader'
  },
  {
    id: '104',
    platform: 'okx',
    api_name: 'O21',
    uid: 'okx-5521',
    usdt: 640.55,
    create_datetime: '2026-09-14 08:12:33',
    status: 1,
    roleType: null
  },
  {
    id: '105',
    platform: 'gate',
    api_name: 'G31',
    uid: 'gate-3310',
    usdt: 430.2,
    create_datetime: '2026-09-15 19:28:07',
    status: 1,
    roleType: null
  }
]

export function createMockApi(input: {
  exchange: string
  api_name: string
}): ApiItem {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  return {
    id: String(Date.now()),
    platform: input.exchange,
    api_name: input.api_name,
    uid: `${input.exchange.slice(0, 3)}-${Math.floor(Math.random() * 90000 + 10000)}`,
    usdt: Number((Math.random() * 2000 + 100).toFixed(4)),
    create_datetime: stamp,
    status: 1,
    roleType: null
  }
}
