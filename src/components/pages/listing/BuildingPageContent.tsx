'use client'

import React, { useEffect } from 'react'

import { Box, Container, Stack, Typography } from '@mui/material'

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
  SummaryDetails
} from './components'

import { formatBuildingAddress } from '../../../utils/properties/formatters'
import UnitCarousel from './components/UnitCarousel'
import BuildingMap from './components/BuildingMap'

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


            {/* <HomeHeaderInfo /> */}
            <DetailsContainer>
              <Stack spacing={{ xs: 4, sm: 6 }}>
                <HomeDescription />

                {mapType === 'static' ? (
                  <BuildingMap type={mapType} />
                ) : (
                  <MapOptionsProvider layout="map" style="hybrid">
                    <BuildingMap />
                  </MapOptionsProvider>
                )}
                {/* <SummaryDetails /> */}
              </Stack>
            </DetailsContainer>

            <Box id="features" sx={{ scrollMarginTop: '100px' }}>
              <FeaturesDetails />
            </Box>
            <AppliancesDetails />
            <ExteriorDetails />
            <RoomsDetails />

            <Box id="active-listings" sx={{ scrollMarginTop: '100px' }}>
              <UnitCarousel properties={similarProperties} />
            </Box>

            {/* <NeighborhoodDetails /> */}
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
  )
}

export default BuildingPageContent
