'use client'

import React, { useContext, useEffect } from 'react'

import { Button } from '@mui/material'

import { FullscreenView } from 'components/atoms'
import FeaturesProvider, { FeaturesContext } from 'providers/FeaturesProvider'
import { features as staticFeatures } from 'features'

import { PageTemplate } from '.'

export type ErrorPageProps = {
  error: Error
  reset?: () => void
}

/**
 * Inner component that uses the features context (must be inside a FeaturesProvider).
 */
const ErrorPageInner = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error('[ErrorPageTemplate]', error)
  }, [error])

  return (
    <PageTemplate>
      <FullscreenView title="500" subtitle="Ooops! Something went wrong!">
        {reset && (
          <Button variant="contained" onClick={reset}>
            Try again
          </Button>
        )}
      </FullscreenView>
    </PageTemplate>
  )
}

/**
 * Next.js error boundaries render outside the normal provider tree,
 * so FeaturesProvider is not available. We re-wrap here with static
 * defaults so Header (which calls useFeatures) doesn't crash.
 */
const ErrorPageTemplate = ({ error, reset }: ErrorPageProps) => {
  const existingContext = useContext(FeaturesContext)

  if (existingContext) {
    // Already inside a FeaturesProvider — render directly
    return <ErrorPageInner error={error} reset={reset} />
  }

  // Outside the provider tree (error boundary) — wrap with static defaults
  return (
    <FeaturesProvider features={staticFeatures}>
      <ErrorPageInner error={error} reset={reset} />
    </FeaturesProvider>
  )
}

export default ErrorPageTemplate
