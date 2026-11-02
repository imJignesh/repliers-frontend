'use client'

import React, { useEffect } from 'react'
import NextLink from 'next/link'

import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import {
  Box,
  Breadcrumbs,
  Container,
  Link,
  Stack,
  Typography
} from '@mui/material'

import { DetailsContainer } from '@shared/Containers'
// Direct imports instead of the `@shared/Dialogs` barrel, which also re-exports
// PropertyDialog, SaveSearchDialog and the AI dialogs (audit RT08).
import FullscreenGalleryDialog from '@shared/Dialogs/FullscreenGalleryDialog'
import FullscreenRibbonDialog from '@shared/Dialogs/FullscreenRibbonDialog'
import GalleryDialog from '@shared/Dialogs/GalleryDialog'
import SlideshowDialog from '@shared/Dialogs/SlideshowDialog'

import { useFeatures } from 'providers/FeaturesProvider'
// import MapOptionsProvider from 'providers/MapOptionsProvider'
import { useProperty } from 'providers/PropertyProvider'
import { useUser } from 'providers/UserProvider'
import useAnalytics from 'hooks/useAnalytics'
import {
  getBuildingHref,
  getPropertyLocationCrumbs
} from 'utils/locationCrumbs'
import { scrubbed } from 'utils/properties'

import { formatShortAddress } from '../../../utils/properties/formatters'

import {
  AppliancesDetails,
  BuildingInfo,
  ExteriorDetails,
  FeaturesDetails,
  HistoryDetails,
  HomeDescription,
  HomeHeaderInfo,
  // HomeMap,
  NavigationBar,
  // NeighborhoodDetails,
  PropertyGallery,
  RoomsDetails,
  Sidebar,
  SimilarPropertyCarousel,
  SummaryDetails
} from './components'

const PropertyPageContent = ({
  embedded = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const building = (
    property as {
      building?: { name: string; slug: string; published?: boolean }
    }
  ).building
  const locationCrumbs = getPropertyLocationCrumbs(property)

  useEffect(() => {
    trackEvent('view_property_page', {
      mls: property.mlsNumber,
      boardId: property.boardId
    })
  }, [])

  // if (features.pdpMapProvider === 'google') {
  //   // eslint-disable-next-line no-param-reassign
  //   mapType = 'static'
  //   // WARN: Google Maps only supports static maps for now.
  //   // Should be extended in the future.
  // }

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
            <Typography
              variant="h1"
              style={{ fontSize: '1.7rem', margin: 0, lineHeight: 1 }}
            >
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
              {/* RT03: only levels the API resolved through the location tree */}
              {locationCrumbs.map((crumb) => (
                <Link
                  key={crumb.url}
                  component={NextLink}
                  href={crumb.url}
                  color="text.secondary"
                  underline="hover"
                >
                  {crumb.name}
                </Link>
              ))}
              {building?.name &&
                !scrubbed(building.name) &&
                // RT03: an unpublished building has no page to link to.
                (getBuildingHref(building) ? (
                  <Link
                    component={NextLink}
                    href={getBuildingHref(building) as string}
                    color="text.primary"
                    underline="hover"
                  >
                    {building.name}
                  </Link>
                ) : (
                  <Typography
                    color="text.primary"
                    sx={{ fontWeight: 500, fontSize: '0.95rem' }}
                  >
                    {building.name}
                  </Typography>
                ))}
            </Breadcrumbs>

            <HomeHeaderInfo />
            <DetailsContainer>
              <Stack spacing={{ xs: 4, sm: 6 }}>
                <BuildingInfo />

                {/* {mapType === 'static' ? (
                  <HomeMap type={mapType} />
                ) : (
                  <MapOptionsProvider layout="map" style="hybrid">
                    <HomeMap />
                  </MapOptionsProvider>
                )} */}
                <SummaryDetails />
                <HomeDescription />
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
