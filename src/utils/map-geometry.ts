import { type Point, type Position } from 'geojson'
import type { LngLatBounds, Map as MapboxMap } from 'mapbox-gl'
import queryString from 'query-string'

import apiConfig from '@configs/api'
import { secondary } from '@configs/colors'
import mapConfig, { type MapStyle } from '@configs/map'
import paramsConfig from '@configs/params'
import routes from '@configs/routes'

import { type ApiBounds, type ApiCoords, type Property } from 'services/API'
import { type Filters, getNonDefaultFilters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'
import { getMakiSymbol } from 'utils/properties'

/**
 * Geometry and URL helpers that do NOT need the Mapbox GL runtime.
 *
 * `mapbox-gl` is a ~1.9 MB (520 KB gzip) client chunk. Before audit RT08
 * (October 2026) every page loaded it because the header search box, the
 * search service and the saved-search provider imported `utils/map`, which
 * constructs `mapboxgl.LngLat` / `mapboxgl.LngLatBounds` at module scope.
 * Everything in this module is plain arithmetic and string formatting, so
 * pages without a map (home, listing, building, static pages) can import it
 * without paying for the map library. `utils/map` re-exports all of it, so
 * map pages keep a single import path.
 *
 * Only `import type` is used from 'mapbox-gl' here; TypeScript erases it.
 */

export type LngLatPoint = { lng: number; lat: number }
export type LngLatPair = [number, number]

export type Polygon = Array<LngLatPoint>

const { defaultAddressZoom, defaultPolygon, mapboxDefaults, mapStyles } =
  mapConfig

/**
 * @description Reduce a polygon from '@configs/map' to its two extreme corners.
 * Mirrors the accumulator used by `getPolygonBounds` in `utils/map`:
 * `tl` carries the highest latitude and lowest longitude, `br` the opposite.
 */
export const getPolygonCorners = (polygon: Polygon) => {
  const { tl, br } = polygon.reduce(
    (acc: any, point: any) => {
      acc.tl.lat = Math.max(acc.tl.lat, point.lat)
      acc.tl.lng = Math.min(acc.tl.lng, point.lng)
      acc.br.lat = Math.min(acc.br.lat, point.lat)
      acc.br.lng = Math.max(acc.br.lng, point.lng)
      return acc
    },
    {
      tl: { lat: -Infinity, lng: Infinity },
      br: { lat: Infinity, lng: -Infinity }
    }
  )
  return { tl, br } as { tl: LngLatPoint; br: LngLatPoint }
}

export const getDefaultPolygonCorners = () => getPolygonCorners(defaultPolygon)

export const roundCoord = (coord: number | string) => Number(coord).toFixed(6)

export const formatCoords = (lngLat: LngLatPoint) => {
  const { lat, lng } = lngLat
  return `${roundCoord(lat)},${roundCoord(lng)}`
}

// Convert Mapbox zoom level to Google Maps zoom level
// Mapbox tends to show more detail at the same zoom level
export const toGoogleZoom = (mapboxZoom: number): number => {
  // Approximate conversion: Google zoom is typically 1-2 levels higher
  // This is based on empirical testing and may need fine-tuning
  const googleZoom = Math.round(mapboxZoom + 1.25)
  // Clamp to Google Maps valid range (0-21)
  return Math.max(0, Math.min(21, googleZoom))
}

export const getMapStyleUrl = (style: MapStyle) =>
  `mapbox://styles/mapbox/${mapStyles[style]}`

export const getMapboxStaticStyleUrl = (style: MapStyle) =>
  `https://api.mapbox.com/styles/v1/mapbox/${mapStyles[style]}/static`

export const getMapboxStaticMarker = (
  longitude: string | number,
  latitude: string | number,
  symbol = 'home'
) => {
  const markerSize = 'l'
  const markerColor = secondary.replace('#', '')
  return `pin-${markerSize}-${symbol}+${markerColor}(${longitude},${latitude})`
}

export const getGmapsStaticMarker = (
  longitude: string | number,
  latitude: string | number,
  symbol = 'home'
) => {
  // Google Maps only supports A-Z, 0-9 in labels
  // For house/home properties, use 'H' as a simple home indicator
  const label = symbol.charAt(0).toUpperCase()

  const markerColor = secondary.replace('#', '')
  return `markers=color:0x${markerColor}%7Clabel:${label}%7C${latitude},${longitude}`
}

type StaticImageUrlParams = {
  point: ApiCoords
  property: Property
  width?: number
  height?: number
  zoom?: number
}

export const getMapboxStaticImageUrl = ({
  point,
  property,
  width = 560,
  height = 200,
  zoom = defaultAddressZoom
}: StaticImageUrlParams): string => {
  const { longitude, latitude } = point
  const imageSize = `${width}x${height}@2x`

  const symbol = getMakiSymbol(property)
  const marker = getMapboxStaticMarker(longitude, latitude, symbol)
  const staticStyleUrl = getMapboxStaticStyleUrl('hybrid')
  const staticImageUrl = `${staticStyleUrl}/${marker}/${longitude},${latitude},${zoom}/${imageSize}?access_token=${mapConfig.mapboxDefaults.accessToken}`

  return staticImageUrl
}

export const getGmapsStaticImageUrl = ({
  point,
  width = 560,
  height = 200,
  zoom = defaultAddressZoom
}: StaticImageUrlParams): string => {
  const { longitude, latitude } = point

  // WARN: google maps static API requires minimum aspect ratio of 16:10
  // if width is greater than 640px (and scale == 2)
  const minAspectRatio = 0.465625 // 16:10 aspect ratio
  if (width > 640 && height / width < minAspectRatio) {
    // eslint-disable-next-line no-param-reassign
    height = Math.round(width * minAspectRatio)
  }

  const size = `${width}x${height}`

  const symbol = '' // getGmapsSymbol(property)

  const marker = getGmapsStaticMarker(longitude, latitude, symbol)
  const params = queryString.stringify({
    size,
    scale: 2, // equivalent to @2x in Mapbox
    zoom: toGoogleZoom(zoom),
    maptype: 'hybrid',
    format: 'jpg',
    key: apiConfig.gmapsApiKey
  })
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
  const staticImageUrl = `${baseUrl}?${marker}&${params}`

  return staticImageUrl
}

export const getMapUrl = ({
  center,
  zoom,
  layout = 'map',
  filters,
  query,
  page
}: {
  center: LngLatPoint
  zoom: number
  layout?: 'map' | 'grid'
  filters?: Filters
  // synthetic query params used by page but not the API
  query?: string | null
  page?: number | string | null
}) => {
  const base = `${routes[layout]}?${formatCoords(center)}&z=${String(zoom).slice(0, 8)}`
  const nonEmptyFilters = getNonDefaultFilters(filters || {})

  const params = queryString.stringify(
    {
      ...nonEmptyFilters,
      page: Number(page) > 1 ? Number(page) : null,
      q: query
    },
    {
      arrayFormat: 'none',
      skipEmptyString: true,
      skipNull: true
    }
  )

  return params ? `${base}&${params}` : base
}

export const getGoogleMapUrl = ({
  center,
  zoom = 15
}: {
  center: LngLatPoint
  zoom?: number
}) => {
  const params = queryString.stringify({
    api: 1,
    query: formatCoords(center),
    zoom
  })
  return `https://www.google.com/maps/search/?${params}`
}

export const getMarkerName = (mlsNumber: string) => `marker-${mlsNumber}`

export const getZoom = (searchParams: URLSearchParams) =>
  toSafeNumber(searchParams.get(paramsConfig.zoom)) || mapboxDefaults.zoom!

/**
 * @description Parse `lat,lng` from the first query parameter name.
 * Returns a plain `{ lng, lat }` object, which Mapbox accepts wherever it
 * takes `LngLatLike` (flyTo, fitBounds, project, …).
 * `getCoords` in `utils/map` wraps this in a `mapboxgl.LngLat` for callers
 * that need the class instance.
 */
export const getCoordsPoint = (
  searchParams: URLSearchParams
): LngLatPoint | null => {
  const firstParam = searchParams.keys().next().value || ''
  const matches = firstParam.match(/([-0-9.]+),([-0-9.]+)/)
  if (!matches) return null
  // Currency/price parsing strips minus signs. Coordinates must retain them
  // or reloading a Canadian search moves the map to the eastern hemisphere.
  const lat = Number(matches[1])
  const lng = Number(matches[2])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null

  return { lng, lat }
}

export const toApiPoint = (point: Point): ApiCoords => {
  const [longitude, latitude] = point.coordinates
  return { longitude, latitude }
}

export const toLngLatPoint = (location: ApiCoords): LngLatPoint => ({
  lng: location.longitude,
  lat: location.latitude
})

/**
 * @description Southwest / northeast corner pair in the shape Mapbox's
 * `LngLatBoundsLike` accepts (`map.fitBounds(toBoundsPair(bounds))`).
 * Corner assignment matches `toMapboxBounds` in `utils/map`: mixed
 * top_left/bottom_right API coordinates become SW = (tl.lng, br.lat) and
 * NE = (br.lng, tl.lat).
 */
export const toBoundsPair = (
  bounds: ApiBounds,
  buffer = 0
): [LngLatPair, LngLatPair] => {
  const { top_left, bottom_right } = bounds
  return [
    [top_left.longitude - buffer, bottom_right.latitude + buffer],
    [bottom_right.longitude + buffer, top_left.latitude - buffer]
  ]
}

/**
 * @description Build ApiBounds from a SW/NE corner pair exactly as
 * `toApiBounds(new mapboxgl.LngLatBounds(sw, ne))` would.
 */
export const cornersToApiBounds = (
  sw: LngLatPoint,
  ne: LngLatPoint
): ApiBounds => ({
  top_left: { latitude: ne.lat, longitude: sw.lng },
  bottom_right: { latitude: sw.lat, longitude: ne.lng }
})

export const toApiBounds = (bounds: LngLatBounds): ApiBounds =>
  cornersToApiBounds(bounds.getSouthWest(), bounds.getNorthEast())

/**
 * @description Rectangle string for the `map` API parameter, built from the
 * two corners a `mapboxgl.LngLatBounds` stores internally (`_sw`, `_ne`).
 * Mapbox derives the other corners as NW = (sw.lng, ne.lat) and
 * SE = (ne.lng, sw.lat); this reproduces that byte for byte, so the request
 * sent to the API is unchanged whether the caller had a real LngLatBounds
 * or only the plain corners.
 */
export const cornersToRectangle = (
  sw: LngLatPoint,
  ne: LngLatPoint,
  buffer = 0
) => {
  /*
    map = [ ↗ NorthEast, ↖ NorthWest, ↙ SouthWest, ↘ SouthEast]
  */
  const nw = { lng: sw.lng, lat: ne.lat }
  const se = { lng: ne.lng, lat: sw.lat }

  // TODO: looks like buffer paddings are not set correctly
  const rectangle = [
    `[${ne.lng + buffer},${ne.lat + buffer}]`, // ↗
    `[${nw.lng - buffer},${nw.lat + buffer}]`, // ↖
    `[${sw.lng - buffer},${sw.lat - buffer}]`, // ↙
    `[${se.lng + buffer},${se.lat - buffer}]` //  ↘
  ]

  return `[[${rectangle.join(',')}]]`
}

export const toRectangle = (bounds: LngLatBounds, buffer = 0) =>
  cornersToRectangle(bounds.getSouthWest(), bounds.getNorthEast(), buffer)

/**
 * @description Same string `toRectangle(getDefaultBounds())` produced, without
 * constructing a `mapboxgl.LngLatBounds`. `getPolygonBounds` passes the
 * reduced `tl` corner as SW and `br` as NE, which is preserved here.
 */
export const getDefaultRectangleString = (buffer = 0) => {
  const { tl, br } = getDefaultPolygonCorners()
  return cornersToRectangle(tl, br, buffer)
}

export const getCenterPoint = (bounds: ApiBounds): LngLatPoint => {
  const { top_left, bottom_right } = bounds
  return {
    lng: (top_left.longitude + bottom_right.longitude) / 2,
    lat: (top_left.latitude + bottom_right.latitude) / 2
  }
}

export const calcZoomLevel = (map: MapboxMap, apiBounds: ApiBounds): number => {
  const [sw, ne] = toBoundsPair(apiBounds)
  const viewportWidth = map.getContainer().clientWidth
  const viewportHeight = map.getContainer().clientHeight

  const maxZoom = map.getMaxZoom()
  const minZoom = map.getMinZoom()

  const northeast = map.project(ne)
  const southwest = map.project(sw)

  const width = Math.abs(northeast.x - southwest.x)
  const height = Math.abs(southwest.y - northeast.y)

  const scaleWidth = viewportWidth / width
  const scaleHeight = viewportHeight / height
  const scale = Math.min(scaleWidth, scaleHeight)
  const zoom = Math.log2(scale) + map.getZoom()

  return Math.max(minZoom, Math.min(maxZoom, zoom))
}

export const calcZoomLevelForBounds = (
  bounds: LngLatBounds,
  width: number,
  height: number
) => {
  const dx = Math.abs(bounds.getEast() - bounds.getWest()) // longitude
  const dy = Math.abs(bounds.getSouth() - bounds.getNorth()) // latitude

  const zoomWidth = Math.log2((width * 180) / (dx * 256))
  const zoomHeight = Math.log2((height * 180) / (dy * 256))
  return Math.min(zoomWidth, zoomHeight)
}

export const calcBoundsAtZoom = (
  map: MapboxMap,
  location: ApiCoords,
  zoom: number
): ApiBounds => {
  const EARTH_RADIUS = 6378137 // in meters
  const mapWidth = map.getContainer().clientWidth
  const mapHeight = map.getContainer().clientHeight

  const zoomPow = 2 ** (zoom + 1)

  const metersPerPixel =
    (2 *
      Math.PI *
      EARTH_RADIUS *
      Math.cos((location.latitude * Math.PI) / 180)) /
    (256 * zoomPow)

  const widthInMeters = mapWidth * metersPerPixel
  const heightInMeters = mapHeight * metersPerPixel

  const latDiff = (heightInMeters / EARTH_RADIUS) * (180 / Math.PI)
  const lngDiff =
    ((widthInMeters / EARTH_RADIUS) * (180 / Math.PI)) /
    Math.cos((location.latitude * Math.PI) / 180)

  const swLng = location.longitude - lngDiff / 2
  const swLat = location.latitude - latDiff / 2
  const neLng = location.longitude + lngDiff / 2
  const neLat = location.latitude + latDiff / 2

  return cornersToApiBounds(
    { lng: swLng, lat: swLat },
    { lng: neLng, lat: neLat }
  )
}

export type { Position }
