'use client'

import { Box, Stack, Typography } from '@mui/material'

import defaultLocation from '@configs/location'

import {
  type ApiBoardArea,
  type ApiBoardCity,
  type ApiNeighborhood
} from 'services/API'
import { useMapOptions } from 'providers/MapOptionsProvider'
import {
  cornersToApiBounds,
  getCenterPoint,
  getDefaultPolygonCorners,
  getMapUrl,
  toApiBounds
} from 'utils/map-geometry'

import { Breadcrumbs } from '..'

// NOTE (audit RT08): the hover map preview (`CatalogMap` + `SeoDescription`
// below, commented out) used to be imported here together with `@turf/turf`
// and `utils/map`, which put Mapbox GL and Turf into the first load of every
// location page although nothing rendered them. If the preview is restored,
// load `simplify` from '@turf/simplify' and the map through `next/dynamic`.

const CatalogHeader = ({
  count,
  viewMode,
  area,
  city,
  hood,
  areas,
  cities,
  hoods,
  location
}: {
  count: number
  viewMode?: 'listings' | 'buildings'
  area?: string
  city?: string
  hood?: string
  areas: ApiBoardArea[]
  cities: ApiBoardCity[]
  hoods: any[]
  location?: ApiBoardCity | ApiNeighborhood
}) => {
  const {
    position: { bounds }
  } = useMapOptions()
  // Same value `getLngLatCenter(bounds || getDefaultBounds())` produced,
  // computed without constructing a mapboxgl.LngLatBounds.
  const { tl, br } = getDefaultPolygonCorners()
  const defaultCenter = getCenterPoint(
    bounds ? toApiBounds(bounds) : cornersToApiBounds(tl, br)
  )

  const current = [defaultLocation.state, area, city, hood].filter(Boolean).at(-1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mapLink = getMapUrl({ center: defaultCenter, zoom: 10 }) // WARN: temporary zoom level, calculate a new value based on bounds

  return (
    <Box>
      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
        <Stack
          spacing={{ xs: 0, sm: 1 }}
          width="100%"
          direction={{ xs: 'column', md: 'row' }}
          justifyContent={'space-between'}
          padding={'40px 0'}
        >
          <Box sx={{ clear: 'both' }}>
            {/* <Button
              href={mapLink}
              target="_blank"
              endIcon={<ExploreIcon />}
              sx={{
                ml: 2,
                mb: -1,
                mr: { xs: -1, md: 0 },
                float: 'right',
                height: '38px',
                whiteSpace: 'nowrap'
              }}
            >
              Explore
            </Button> */}
            <Typography variant="h1" style={{ fontSize: '2rem', lineHeight: 1.2 }}>
              {current}{' '}
              <span> Condos for Resale</span>
            </Typography>


          </Box>
          <Breadcrumbs area={area} city={city} hood={hood} />
          {/* <SeoDescription
            count={count}
            area={area}
            city={city}
            hood={hood}
            areas={areas}
            cities={cities}
            hoods={hoods}
            location={location}
            onLinkFocus={handleLinkFocus}
            onLinkBlur={handleLinkBlur}
          /> */}
        </Stack>

        {/* <CatalogMap coordinates={coordinates} center={center} /> */}
      </Stack>
    </Box>
  )
}

export default CatalogHeader
