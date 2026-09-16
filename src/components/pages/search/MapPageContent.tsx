'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Position } from 'geojson'
import { Box, Typography } from '@mui/material'
import { type LngLat, type LngLatBounds } from 'mapbox-gl'

import MapService from 'services/Map'
import {
  type Filters,
  getClusterParams,
  getDefaultRectangle,
  getListingFields,
  getMapPolygon,
  getMapRectangle,
  getPageParams
} from 'services/Search'
import { type MapPosition, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { getMapUrl } from 'utils/map'
import { updateWindowHistory } from 'utils/urls'

import MapFilters from './components/MapFilters'
import MapRoot from './components/MapRoot'

const MapPageContent = ({ heading }: { heading: string }) => {
  const searchParams = useSearchParams()
  const [mapLoaded, setMapLoaded] = useState(false)
  const { search, save, clearResults, filters, polygon } = useSearch()
  const { layout, position, setPosition } = useMapOptions()

  const query = searchParams.get('q')
  const page = searchParams.get('page')

  const fetchData = async (
    position: MapPosition,
    filters: Filters,
    polygon: Position[] | null,
    isCurrent: () => boolean
  ) => {
    const { zoom, bounds } = position

    const fetchBounds = polygon
      ? getMapPolygon(polygon)
      : bounds
        ? getMapRectangle(bounds)
        : getDefaultRectangle()

    const response = await search({
      ...filters,
      ...fetchBounds,
      ...getPageParams(),
      ...getListingFields(),
      ...getClusterParams(zoom)
    })

    if (!response || !isCurrent()) return

    const { list, clusters, count } = save(response)

    MapService.update(list, clusters, count)
  }

  const handleMapLoad = (
    bounds: LngLatBounds,
    center: LngLat,
    zoom: number
  ) => {
    setMapLoaded(true)
    setPosition({ bounds, center, zoom })
  }

  const handleMapMove = (
    bounds: LngLatBounds,
    center: LngLat,
    zoom: number
  ) => {
    setPosition({ bounds, center, zoom })
  }

  const { center, zoom } = position

  useEffect(() => {
    if (!mapLoaded) return
    if (!center || !zoom) return
    let current = true
    clearResults()
    MapService.hidePopup()
    MapService.update([], [], 0)
    void fetchData(position, filters, polygon, () => current)
    return () => {
      current = false
    }
  }, [mapLoaded, position, filters, polygon])

  const prevParams = useRef(JSON.stringify({ center, zoom, filters }))
  const curParams = JSON.stringify({ center, zoom, filters })
  const shouldReplaceUrl = curParams !== prevParams.current

  // WARN: every `center`|`zoom`|`filters` change should reset the page to 1
  useEffect(() => {
    if (!center || !zoom) return
    if (!shouldReplaceUrl) return
    prevParams.current = curParams
    const url = getMapUrl({ center, zoom, layout, filters, query })
    updateWindowHistory(url)
  }, [shouldReplaceUrl])

  // WARN: switching between `grid` and `map` should KEEP the same page number
  // WARN: layout (grid|map) changes should NOT use the router,
  // but rather update the window history URL directly
  useEffect(() => {
    if (!center || !zoom) return
    const url = getMapUrl({ center, zoom, layout, filters, query, page })
    updateWindowHistory(url)
  }, [layout])

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 1, bgcolor: 'background.paper' }}>
        <Typography component="h1" sx={{ fontSize: { xs: 18, md: 20 }, fontWeight: 600 }}>
          {heading}
        </Typography>
      </Box>
      <MapFilters />
      <MapRoot
        zoom={zoom}
        center={center}
        polygon={polygon}
        onMove={handleMapMove}
        onLoad={handleMapLoad}
      />
    </>
  )
}

export default MapPageContent
