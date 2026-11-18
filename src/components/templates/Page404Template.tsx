'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Box, Button, Stack } from '@mui/material'

import routes from '@configs/routes'

import Yoda from 'assets/common/yoda.svg'

import { FullscreenView } from 'components/atoms'

import PageTemplate from './PageTemplate'

const phrases = {
  401: 'Access, you have not. Authorized, you must be.',
  403: 'Forbidden, your request is. The path, you cannot walk.',
  404: 'Page not found.'
} as const

type ErrorCode = keyof typeof phrases

const Page40XTemplate = ({ errorCode = 404 }: { errorCode?: ErrorCode }) => {
  return (
    <PageTemplate>
      <FullscreenView title={String(errorCode)} subtitle={phrases[errorCode]}>
        {/* Audit 4 T14: give visitors a way on from a missing page. */}
        <Box pt={2}>
          {errorCode === 404 && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="center"
            >
              <Button component={Link} href={routes.map} variant="contained">
                Search condos on the map
              </Button>
              <Button component={Link} href={routes.listings} variant="outlined">
                Browse areas
              </Button>
              <Button component={Link} href={routes.home} variant="outlined">
                Home
              </Button>
            </Stack>
          )}
        </Box>
      </FullscreenView>
    </PageTemplate>
  )
}

export default Page40XTemplate
