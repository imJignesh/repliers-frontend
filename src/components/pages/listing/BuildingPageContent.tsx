'use client'

import React, { useEffect, useMemo } from 'react'

import { Box, Container, Stack, Typography, Breadcrumbs, Link } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NextLink from 'next/link'
import { getCatalogUrl } from '../../../utils/urls'

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
import PropertyDetailsProvider, { config } from 'providers/PropertyDetailsProvider'
import { useUser } from 'providers/UserProvider'
import useAnalytics from 'hooks/useAnalytics'

import { type Property } from 'services/API'
import {
  AppliancesDetails,
  ExteriorDetails,
  FeaturesDetails,
  HistoryDetails,
  BuildingHistoryDetails,
  HomeDescription,
  HomeHeaderInfo,
  HomeMap,
  NavigationBar,
  NavigationBarBuildings,
  NeighborhoodDetails,
  PropertyGallery,
  BuildingGallery,
  RoomsDetails,
  Sidebar,
  SimilarPropertyCarousel,
  SummaryDetails,
  BuildingInfo,
  UnitCarousel,
  BuildingMap
} from './components'

import { formatBuildingAddress } from '../../../utils/properties/formatters'

const BuildingPageContent = ({
  embedded = false,
  mapType = 'interactive',
  similarProperties = [],
  history = []
}: {
  embedded?: boolean
  mapType?: 'interactive' | 'static'
  similarProperties?: Property[]
  history?: Property[]
}) => {
  const trackEvent = useAnalytics()
  const { agentRole } = useUser()
  const features = useFeatures()
  const { property } = useProperty()
  const { address } = property

  const propertyDetails = useMemo(
    () => config[property.class]?.(property) || config.default(property),
    [property]
  )

  useEffect(() => {
    trackEvent('view_building_page', {
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
    <PropertyDetailsProvider property={property}>
      <Stack spacing={2} pb={4}>
        <Container>
          <BuildingGallery
            activeCount={similarProperties.length}
            historyCount={history.length}
          />
        </Container>



        <Container>
          <Stack
            spacing={4}
            width="100%"
            alignItems="flex-start"
            justifyContent="space-between"
            direction={{ xs: 'column', md: 'row' }}
          >
            <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{
                  mb: 1,
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
                    color="text.primary"
                    underline="hover"
                  >
                    {address.neighborhood}
                  </Link>
                )}
              </Breadcrumbs>



              {/* <HomeHeaderInfo /> */}



              <BuildingInfo />



              <HomeDescription />


              <Box id="features" sx={{ scrollMarginTop: '100px' }}>
                <FeaturesDetails features={propertyDetails.features} />
              </Box>
              <AppliancesDetails appliances={propertyDetails.appliances} />
              {/* <ExteriorDetails exterior={propertyDetails.exterior} /> */}

              {/* <RoomsDetails rooms={propertyDetails.rooms} /> */}

              <Box id="active-listings" sx={{ scrollMarginTop: '100px' }}>
                <UnitCarousel properties={similarProperties} />
              </Box>

              <NeighborhoodDetails neighborhood={propertyDetails.neighborhood} />
              <Box id="history" sx={{ scrollMarginTop: '100px' }}>
                <BuildingHistoryDetails history={history} />
              </Box>


            </Stack>

            {
              features.pdpSidebar && !agentRole && (
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
              )
            }

          </Stack >

          {features.pdpGridGallery && <GalleryDialog />}
          {features.pdpSlideshow && <SlideshowDialog />}
          {features.pdpFullscreenGallery && <FullscreenRibbonDialog />}
          {features.pdpFullscreenGallery && <FullscreenGalleryDialog />}

        </Container >

      </Stack >
    </PropertyDetailsProvider>
  )
}

export default BuildingPageContent
