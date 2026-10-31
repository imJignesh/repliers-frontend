import { type Feature, type Position } from 'geojson'
import mapboxgl, { type LngLatBounds } from 'mapbox-gl'
import { type Map as MapboxMap } from 'mapbox-gl'

import { lighten } from '@mui/material'

import { info } from '@configs/colors'
import mapConfig from '@configs/map'

import { type ApiBounds, type ApiCoords } from 'services/API'
import {
  getCoordsPoint,
  getPolygonCorners,
  type Polygon,
  toApiBounds
} from 'utils/map-geometry'

/**
 * Helpers that need the Mapbox GL runtime (they construct `mapboxgl.LngLat`
 * or `mapboxgl.LngLatBounds`, or draw on a map). Importing this module pulls
 * the whole `mapbox-gl` chunk into the page, so only map pages should use it.
 * Pure helpers live in `utils/map-geometry` and are re-exported here so
 * existing `import { … } from 'utils/map'` call sites keep working.
 */
export * from 'utils/map-geometry'

const { defaultPolygon } = mapConfig

/**
 * @description Function to convert custom polygon object from '@configs/map' module to mapbox bounds
 */
export const getPolygonBounds = (polygon: Polygon) => {
  const { tl, br } = getPolygonCorners(polygon)
  return new mapboxgl.LngLatBounds(tl, br)
}

export const getPositionBounds = (position: Position[]) => {
  return getPolygonBounds(position.map(([lng, lat]) => ({ lng, lat })))
}

export const getDefaultBounds = () => {
  return getPolygonBounds(defaultPolygon)
}

export const getCoords = (searchParams: URLSearchParams) => {
  const point = getCoordsPoint(searchParams)
  return point ? new mapboxgl.LngLat(point.lng, point.lat) : null
}

export const toMapboxPoint = (location: ApiCoords) => {
  const { latitude, longitude } = location
  return new mapboxgl.LngLat(longitude, latitude)
}

export const toMapboxBounds = (bounds: ApiBounds, buffer = 0) => {
  const { top_left, bottom_right } = bounds

  return new mapboxgl.LngLatBounds(
    // converting mixed top_left coords to northeast (mapbox._NE)
    [top_left.longitude - buffer, bottom_right.latitude + buffer],
    // and mixed bottom_right to southwest (mapbox._SW)
    [bottom_right.longitude + buffer, top_left.latitude - buffer]
  )
}

export const getCenter = (bounds: ApiBounds) => {
  const { top_left, bottom_right } = bounds

  return new mapboxgl.LngLat(
    (top_left.longitude + bottom_right.longitude) / 2,
    (top_left.latitude + bottom_right.latitude) / 2
  )
}

export const getLngLatCenter = (bounds: LngLatBounds) =>
  getCenter(toApiBounds(bounds))

export const removePolygon = (map: MapboxMap) => {
  try {
    map.removeLayer('polygon-fill')
    map.removeLayer('polygon-outline')
    map.removeSource('polygon')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // TODO: not sure we need to handle this error. Mapbox cant control its own sources
  }
}

export const addPolygon = (map: MapboxMap, polygon: Position[]) => {
  if (polygon) {
    const polygonGeoJSON: Feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygon]
      },
      properties: {}
    }

    map.addSource('polygon', {
      type: 'geojson',
      data: polygonGeoJSON
    })

    map.addLayer({
      id: 'polygon-fill',
      type: 'fill',
      source: 'polygon',
      paint: {
        'fill-color': info,
        'fill-opacity': 0.25
      }
    })

    map.addLayer({
      id: 'polygon-outline',
      type: 'line',
      source: 'polygon',
      paint: {
        'line-color': lighten(info, 0.2),
        'line-width': 1.5
      }
    })
  }
}
