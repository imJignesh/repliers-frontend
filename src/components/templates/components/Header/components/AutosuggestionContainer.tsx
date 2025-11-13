import React, { Suspense } from 'react'

import { Box } from '@mui/material'

import { useFeatures } from 'providers/FeaturesProvider'

const AutosuggestionContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  const features = useFeatures()

  return (
    <Box
      sx={{
        display: {
          xs: 'flex',
          md: features.searchPosition === 'menu' ? 'flex' : 'none'
        },
        width: { xs: '90%', sm: '100%', md: '100%' },
        pl: { xs: 0, md: 1, lg: 3 },
        pr: { xs: 0, lg: 1 },
        maxWidth: 620,
        flex: 1,
        margin: 'auto'
      }}
    >
      <Suspense>{children}</Suspense>
    </Box>
  )
}
export default AutosuggestionContainer
