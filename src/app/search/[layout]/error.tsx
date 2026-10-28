'use client'

// Route-level error boundary for /search/map and /search/grid. A client-side
// rendering failure here is not a server error; say what happened and keep
// the user on a route that still lists properties (audit RT05).

import { useEffect } from 'react'

import { Button, Stack } from '@mui/material'

import routes from '@configs/routes'

import { FullscreenView } from 'components/atoms'
import { type ErrorPageProps } from 'components/templates/ErrorPageTemplate'
import PageTemplate from 'components/templates/PageTemplate'

export default function SearchErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[SearchErrorPage]', error)
  }, [error])

  return (
    <PageTemplate>
      <FullscreenView
        title="Search display problem"
        subtitle="The search page could not be drawn in this browser. The listings are still available."
      >
        <Stack direction="row" spacing={2}>
          <Button variant="contained" href={routes.listings}>
            Browse listings by location
          </Button>
          {reset && (
            <Button variant="outlined" onClick={reset}>
              Try again
            </Button>
          )}
        </Stack>
      </FullscreenView>
    </PageTemplate>
  )
}
