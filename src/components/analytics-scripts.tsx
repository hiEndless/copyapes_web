'use client'

import { useEffect } from 'react'

const LA_ID = '3ID9Aw1hNsoyCcId'
const GTM_ID = 'GTM-T656N8D8'

declare global {
  interface Window {
    LA?: {
      init: (config: { id: string; ck: string }) => void
    }
  }
}

const loadScript = (src: string, id: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null

    if (existing?.dataset.loaded === 'true') {
      resolve()

      return
    }

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })

      return
    }

    const script = document.createElement('script')

    script.id = id
    script.src = src
    script.async = true

    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }

    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })

const AnalyticsScripts = () => {
  useEffect(() => {
    void loadScript('https://sdk.51.la/js-sdk-pro.min.js', 'LA_COLLECT')
      .then(() => {
        window.LA?.init({ id: LA_ID, ck: LA_ID })
      })
      .catch(() => {})

    if (!document.getElementById('gtm-script')) {
      const gtmScript = document.createElement('script')

      gtmScript.id = 'gtm-script'
      gtmScript.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`
      document.head.appendChild(gtmScript)
    }
  }, [])

  return (
    <noscript
      dangerouslySetInnerHTML={{
        __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
      }}
    />
  )
}

export default AnalyticsScripts
