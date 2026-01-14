import React from 'react'

import { Box, Container, Typography } from '@mui/material'

type HeaderBannerProps = {
  minHeight?: number
  overlayOpacity?: number
  children?: React.ReactNode
}

const HeaderBanner = ({
  minHeight = 150,
  overlayOpacity = 0.7,
  children
}: HeaderBannerProps) => {
  return (
    <Box
      minHeight={minHeight}
      position="relative"
      display="flex"
      alignItems="center"
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        bgcolor="#0393c9"
        sx={{ '& img': { opacity: overlayOpacity } }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', px: 2 }}>
        <Typography variant="h1" color="common.white" sx={{ fontSize: '2.5rem' }}>
          {children}
        </Typography>
      </Container>
    </Box>
  )
}

export default HeaderBanner
