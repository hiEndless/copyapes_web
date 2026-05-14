export function formatUsdtBalance(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
