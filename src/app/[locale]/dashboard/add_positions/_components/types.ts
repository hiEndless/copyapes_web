export type QuantityUnitLabel = '张' | '个'

export type PositionMarginMode = 'cross' | 'isolated'

export type OpenSide = 'long' | 'short'

export type TradingApiMock = {
  id: string
  exchangeName: string
  label: string
  /** 账户余额（USDT），演示数据；接入后端后由接口填充 */
  balanceUsdt: number
  exchangeKey: string
  /** 对应 `public/` 下路径，如 `/exchanges/binance.png` */
  logoSrc: string
  quantityUnit: QuantityUnitLabel
}
