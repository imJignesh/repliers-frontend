'use client'

import { type ReactNode, Suspense } from 'react'

import { Box, Stack } from '@mui/material'

import { LoadingView } from 'components/atoms'

import DialogWindows from './components/DialogWindows'
import Footer from './components/Footer'
import Header from './components/Header'

const PageTemplate = ({
  loading = false,
  noHeader = false,
  noFooter = false,
  bgcolor = '',
  children
}: {
  loading?: boolean
  noHeader?: boolean
  noFooter?: boolean
  bgcolor?: string
  children: ReactNode
}) => {
  return (
    <>
      <Suspense fallback={null}>
        <DialogWindows />
      </Suspense>
      <Stack direction="column" minHeight="100svh" bgcolor={bgcolor}>
        {/* Audit 4 T13: skip link, visible only when focused. */}
        <Box
          component="a"
          href="#main-content"
          sx={{
            position: 'absolute',
            left: 8,
            top: -100,
            zIndex: 2000,
            px: 2,
            py: 1,
            bgcolor: 'background.paper',
            color: 'primary.main',
            borderRadius: 1,
            boxShadow: 2,
            '&:focus': { top: 8 }
          }}
        >
          Skip to main content
        </Box>
        {!noHeader && <Header />}
        <Box component="main" id="main-content" tabIndex={-1} flex={1} sx={{ '&:focus': { outline: 'none' } }}>
          {loading ? <LoadingView noHeader={noHeader} /> : children}
        </Box>
        {!noFooter && <Footer />}
      </Stack>
    </>
  )
}

export default PageTemplate
