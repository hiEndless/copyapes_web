import React from 'react'

const CardBannerEdge = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M0 0H24V24C24 10.7452 13.2548 0 0 0Z" fill="currentColor" />
    </svg>
  )
}

export default CardBannerEdge
