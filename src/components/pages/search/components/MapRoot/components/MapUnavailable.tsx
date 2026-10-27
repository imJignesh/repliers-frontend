'use client'

import React from 'react'

import { Alert, AlertTitle, Button, Stack } from '@mui/material'

import { isRecoverableMapFailure, type MapFailure } from 'utils/map-init'

/**
 * Shown in place of the Mapbox canvas (and as a banner above the results)
 * when the map could not start or lost its WebGL context. The search itself
 * keeps working; this only explains why the map is missing (audit RT05).
 */
const MapUnavailable = ({
  failure,
  variant = 'overlay',
  onShowList,
  onRetry
}: {
  failure: MapFailure
  variant?: 'overlay' | 'banner'
  onShowList?: () => void
  onRetry?: () => void
}) => {
  const recoverable = isRecoverableMapFailure(failure)

  return (
    <Alert
      severity="warning"
      role="status"
      data-map-unavailable={failure.kind}
      sx={
        variant === 'overlay'
          ? {
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              zIndex: 'fab',
              maxWidth: 520,
              mx: 'auto'
            }
          : { mx: 2, mt: 1, mb: 0 }
      }
    >
      <AlertTitle>Map unavailable</AlertTitle>
      {failure.message}
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        {onShowList && (
          <Button size="small" variant="contained" onClick={onShowList}>
            Show results as a list
          </Button>
        )}
        {recoverable && onRetry && (
          <Button size="small" variant="outlined" onClick={onRetry}>
            Reload map
          </Button>
        )}
      </Stack>
    </Alert>
  )
}

export default MapUnavailable
