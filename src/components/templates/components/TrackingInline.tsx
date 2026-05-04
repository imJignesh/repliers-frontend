/* eslint-disable max-len */

import React from 'react'
import Script from 'next/script'
import * as process from 'process'

const {
  NEXT_PUBLIC_TAWK_ENABLED,
  NEXT_PUBLIC_FOLLOWUPBOSS_ENABLED,

  NEXT_PUBLIC_FOLLOWUPBOSS_ID,
  NEXT_PUBLIC_TAWK_ID
} = process.env

const tawkEnabled = NEXT_PUBLIC_TAWK_ENABLED === 'true'
const pixelEnabled = NEXT_PUBLIC_FOLLOWUPBOSS_ENABLED === 'true'
const gaId = process.env.NEXT_PUBLIC_GTAG_KEY || ''
const gtmId = process.env.NEXT_PUBLIC_GTM_KEY || ''
const clickyId = process.env.NEXT_PUBLIC_CLICKY_ID || ''

const TrackingInline = () => {
  return (
    <>
      {/* Google Analytics — deferred to idle */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="lazyOnload"
          />
          <Script id="gtag-init" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager — deferred to idle */}
      {gtmId && (
        <Script id="gtm-init" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}

      {/* Clicky Analytics — deferred to idle */}
      {clickyId && (
        <>
          <Script id="clicky-init" strategy="lazyOnload">
            {`var clicky_site_ids = clicky_site_ids || []; clicky_site_ids.push(${clickyId});`}
          </Script>
          <Script
            src="//static.getclicky.com/js"
            strategy="lazyOnload"
          />
        </>
      )}

      {pixelEnabled && (
        <Script id="pixel" strategy="lazyOnload">
          {`
          (function(w,i,d,g,e,t){w["WidgetTrackerObject"]=g;(w[g]=w[g]||function() {(w[g].q=w[g].q||[]).push(arguments);}),(w[g].ds=1*new Date());(e="script"), (t=d.createElement(e)),(e=d.getElementsByTagName(e)[0]);t.async=1;t.src=i; e.parentNode.insertBefore(t,e);}) (window,"https://widgetbe.com/agent",document,"widgetTracker"); window.widgetTracker("create", "${NEXT_PUBLIC_FOLLOWUPBOSS_ID}"); window.widgetTracker("send", "pageview");
          `}
        </Script>
      )}
      {tawkEnabled && (
        <Script id="tawk" strategy="lazyOnload">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/${NEXT_PUBLIC_TAWK_ID}/default';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      )}
    </>
  )
}

export default TrackingInline
