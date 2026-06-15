'use client'

import React from 'react'
import Image from 'next/image'

import { Box } from '@mui/material'

import Yoda from 'assets/common/yoda.svg'

import { FullscreenView } from 'components/atoms'

import { PageTemplate } from '.'

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
        <Box pt={2}>

        </Box>
      </FullscreenView>
    </PageTemplate>
  )
}

export default Page40XTemplate
