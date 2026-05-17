'use client'

import { useEffect } from 'react'

const LA_ID = '3ID9Aw1hNsoyCcId'
const GTM_ID = 'GTM-T656N8D8'

const loadScript = (src: string, id: string) => {
  if (document.getElementById(id)) {
    return
  }

  const script = document.createElement('script')
  script.id = id
  script.src = src
  script.async = true
  document.head.appendChild(script)
}

const AnalyticsScripts = () => {
  useEffect(() => {
    loadScript('https://sdk.51.la/js-sdk-pro.min.js', 'LA_COLLECT')

    if (!document.getElementById('LA_INIT')) {
      const initScript = document.createElement('script')
      initScript.id = 'LA_INIT'
      initScript.text = `LA.init({id:"${LA_ID}",ck:"${LA_ID}"})`
      document.head.appendChild(initScript)
    }

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
