import React from 'react'
import type { Metadata } from 'next'

import PageTemplate from 'components/templates/PageTemplate'
import HomePageContent from '@pages/home'
import routes from '@configs/routes'

import { fetchFeatures } from 'utils/features'

import { headers } from 'next/headers'
import { getProtocolHost } from 'utils/urls'

// NOTE: Dynamically generate metadata for the Estimate Landing Page based on feature flags.
// When manually setting rootPage with feature flags for the estimate page,
// Next.js does not recognize EstimatePage as a page component and skips page-level metadata configuration.
// To prevent this, metadata must be generated dynamically using feature flags.
export const generateMetadata = async (props: any): Promise<Metadata> => {
  const features = await fetchFeatures()
  const host = getProtocolHost(await headers())

  if (process.env.NEXT_PUBLIC_ROOT_PAGE === 'estimate' && features.rootPage === 'estimate') {
    const { generateMetadata: generateEstimateMetadata } = await import(
      'app/(Estimates)/estimate/[[...slugs]]/page'
    )
    return await generateEstimateMetadata(props)
  }
  // other pages will be handled inside layout.tsx
  return {
    alternates: {
      canonical: host + routes.home
    },
    openGraph: {
      url: host + routes.home
    }
  }
}

const HomePage = async (props: any) => {
  const features = await fetchFeatures()

  if (process.env.NEXT_PUBLIC_ROOT_PAGE === 'estimate' && features.rootPage === 'estimate') {
    const { default: EstimatePage } = await import(
      'app/(Estimates)/estimate/[[...slugs]]/page'
    )
    return <EstimatePage {...props} />
  }

  return (
    <PageTemplate>
      <HomePageContent />
    </PageTemplate>
  )
}

export default HomePage
