import React from 'react'

import { Box } from '@mui/material'

const BannerContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      minHeight={{ xs: 640, md: '300px' }}
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {children}
    </Box>
  )
}

export default BannerContainer
