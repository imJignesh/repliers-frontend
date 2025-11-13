import React from 'react'

import BannerContainer from './BannerContainer'
import BannerDescription from './BannerDescription'
import BannerImage from './BannerImage'
import {
  Autosuggestion,
  AutosuggestionContainer
} from '@templates/Header/components'
import { Box, Stack } from '@mui/material'
import { background } from '@defaults/colors'

const HomePageBanner = ({
  title = '',
  subtitle = '',
  children
}: {
  title?: string
  subtitle?: string
  children?: React.ReactNode
}) => {
  return (
    <BannerContainer>
      <BannerImage />
      <Stack
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <BannerDescription title={title} subtitle={subtitle} />
        {1 && (
          <AutosuggestionContainer>
            <Autosuggestion />
          </AutosuggestionContainer>
        )}

        {children}
      </Stack>
    </BannerContainer>
  )
}

export default HomePageBanner
