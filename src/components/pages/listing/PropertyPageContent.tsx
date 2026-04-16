'use client'

import React, { useEffect } from 'react'
import NextLink from 'next/link'

import { Box, Container, Stack, Typography, Breadcrumbs, Link } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

import { DetailsContainer } from '@shared/Containers'
import {
  FullscreenGalleryDialog,
  FullscreenRibbonDialog,
  GalleryDialog,
  SlideshowDialog
} from '@shared/Dialogs'

import { useFeatures } from 'providers/FeaturesProvider'
import MapOptionsProvider from 'providers/MapOptionsProvider'
import { useProperty } from 'providers/PropertyProvider'
import { useUser } from 'providers/UserProvider'
import useAnalytics from 'hooks/useAnalytics'

import {
  AppliancesDetails,
  ExteriorDetails,
  FeaturesDetails,
  HistoryDetails,
  HomeDescription,
  HomeHeaderInfo,
  HomeMap,
  NavigationBar,
  NeighborhoodDetails,
  PropertyGallery,
  RoomsDetails,
  Sidebar,
  SimilarPropertyCarousel,
  SummaryDetails
} from './components'

import { formatShortAddress } from '../../../utils/properties/formatters'
import { getCatalogUrl } from '../../../utils/urls'

const PropertyPageContent = ({
  embedded = false,
  mapType = 'interactive'
}: {
  embedded?: boolean
  mapType?: 'interactive' | 'static'
}) => {
  const trackEvent = useAnalytics()
  const { agentRole } = useUser()
  const features = useFeatures()
  const { similarProperties, property } = useProperty()
  const { address } = property

  useEffect(() => {
    trackEvent('view_property_page', {
      mls: property.mlsNumber,
      boardId: property.boardId
    })
  }, [])

  if (features.pdpMapProvider === 'google') {
    // eslint-disable-next-line no-param-reassign
    mapType = 'static'
    // WARN: Google Maps only supports static maps for now.
    // Should be extended in the future.
  }

  return (
    <Stack spacing={2} pb={4}>
      <Container>
        <PropertyGallery />
      </Container>

      <NavigationBar embedded={embedded} />

      <Container>
        <Stack
          spacing={4}
          width="100%"
          alignItems="flex-start"
          justifyContent="space-between"
          direction={{ xs: 'column', md: 'row' }}
        >
          <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
            <Typography variant="h1" style={{ fontSize: '1.7rem', margin: 0, lineHeight: 1 }}>
              {formatShortAddress(address)}
            </Typography>

            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{
                mt: -1,
                '& .MuiBreadcrumbs-li': {
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }
              }}
            >
              {address.city && (
                <Link
                  component={NextLink}
                  href={getCatalogUrl(address.city)}
                  color="text.secondary"
                  underline="hover"
                >
                  {address.city}
                </Link>
              )}
              {address.neighborhood && (
                <Link
                  component={NextLink}
                  href={getCatalogUrl(address.city, address.neighborhood)}
                  color="text.secondary"
                  underline="hover"
                >
                  {address.neighborhood}
                </Link>
              )}
              {(property as any).building?.name && (
                <Link
                  component={NextLink}
                  href={`/r/building/${(property as any).building.slug}`}
                  color="text.primary"
                  underline="hover"
                >
                  {(property as any).building.name}
                </Link>
              )}
            </Breadcrumbs>

            <HomeHeaderInfo />
            <DetailsContainer>
              <Stack spacing={{ xs: 4, sm: 6 }}>
                <HomeDescription />

                {/* {mapType === 'static' ? (
                  <HomeMap type={mapType} />
                ) : (
                  <MapOptionsProvider layout="map" style="hybrid">
                    <HomeMap />
                  </MapOptionsProvider>
                )} */}
                <SummaryDetails />
              </Stack>
            </DetailsContainer>
            <FeaturesDetails />
            <AppliancesDetails />
            <HistoryDetails />
            <ExteriorDetails />
            <RoomsDetails />
            {/* <NeighborhoodDetails /> */}

          </Stack>

          {features.pdpSidebar && !agentRole && (
            <Box
              sx={{
                top: 32 + (embedded ? 52 : 60),
                // 32px is the offset between content containers
                // 52 / 60px is the height of the NavigationBar wheither it's embedded or not
                minWidth: 276,
                flexShrink: 0, // badly formatted content from the main column tries to push the sidebar out of the screen
                width: { xs: '100%', md: 276 },
                position: { xs: 'static', md: 'sticky' },
                '& .MuiPaper-root': {
                  height: 'auto'
                }
              }}
            >
              <Sidebar />
            </Box>
          )}
        </Stack>

        {features.pdpGridGallery && <GalleryDialog />}
        {features.pdpSlideshow && <SlideshowDialog />}
        {features.pdpFullscreenGallery && <FullscreenRibbonDialog />}
        {features.pdpFullscreenGallery && <FullscreenGalleryDialog />}
      </Container>
      <SimilarPropertyCarousel properties={similarProperties} />
    </Stack>
  )
}

export default PropertyPageContent
