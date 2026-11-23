import React, { type ComponentType } from 'react'
import { type Metadata, type Viewport } from 'next'
import { getLocale, getMessages } from 'next-intl/server'

import { GlobalStyles } from '@mui/material'

import content from '@configs/content'
import globalStyles from '@configs/theme/global'
import TrackingInline from '@templates/TrackingInline'

import { APISearch } from 'services/API'
import { fetchFeatureOptions } from 'utils/features'

import 'styles/globals.css'

import Providers from './_providers'

const gbInitMode = process.env.NEXT_PUBLIC_GROWTHBOOK_INIT || 'ssg'

export const metadata: Metadata = content.siteMetadata

export const viewport: Viewport = {
  themeColor: 'white',
  width: 'device-width',
  initialScale: 1
  // interactiveWidget: 'resizes-visual'
}

export type ProviderComponent = [ComponentType<any>, object?]

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { features, options } = await fetchFeatureOptions(gbInitMode)

  const locations = features.search
    ? await APISearch.fetchLocations({
        next: { tags: ['locations'], revalidate: 86400 }
      })
    : null

  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        {/* Preconnect to critical external origins for faster resource loading */}
        <link rel="preconnect" href="https://cdn.repliers.io" />
        <link rel="dns-prefetch" href="https://cdn.repliers.io" />
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
      </head>
      <body>
        <Providers
          locale={locale}
          messages={messages}
          features={features}
          featureOptions={options}
          locations={locations}
        >
          <GlobalStyles styles={globalStyles} />
          {children}
        </Providers>
        {/* Tracking scripts loaded after main content */}
        <TrackingInline />
        {/* reCAPTCHA is loaded by the enquiry forms when they get focus
            (utils/recaptcha preloadRecaptcha), not on every page (audit TA06). */}
      </body>
    </html>
  )
}

export default Layout
