import React from 'react'

const ProductInsightsCard = ({ className }: { className?: string }) => {
  return (
    <div className={`rounded-xl border bg-card p-4 shadow-sm ${className || ''}`}>
      <h3 className="font-semibold text-lg">Product Insights</h3>
      <p className="text-sm text-muted-foreground mt-2">Data insights are currently unavailable.</p>
    </div>
  )
}

export default ProductInsightsCard
