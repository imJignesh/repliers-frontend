import mapConfig from '@configs/map'

import {
  calcBoundsAtZoom,
  cornersToApiBounds,
  cornersToRectangle,
  getCoordsPoint,
  getDefaultPolygonCorners,
  getDefaultRectangleString,
  toApiBounds,
  toBoundsPair,
  toRectangle
} from './map-geometry'

/**
 * These helpers replace `mapboxgl.LngLat` / `mapboxgl.LngLatBounds` based
 * code on pages without a map (audit RT08). The expectations below are the
 * values the Mapbox classes produce: `new LngLatBounds(sw, ne)` stores the two
 * corners as given, and derives NW = (sw.lng, ne.lat), SE = (ne.lng, sw.lat).
 */

// Minimal stand-in with the same getters mapboxgl.LngLatBounds exposes.
const fakeBounds = (
  sw: { lng: number; lat: number },
  ne: { lng: number; lat: number }
) =>
  ({
    getSouthWest: () => sw,
    getNorthEast: () => ne,
    getNorthWest: () => ({ lng: sw.lng, lat: ne.lat }),
    getSouthEast: () => ({ lng: ne.lng, lat: sw.lat })
  }) as any

describe('utils/map-geometry', () => {
  it('reduces the default polygon to the same corners getPolygonBounds used', () => {
    const { tl, br } = getDefaultPolygonCorners()
    expect(tl).toEqual({ lat: 46.8, lng: -83.5 })
    expect(br).toEqual({ lat: 41.6, lng: -74 })
    expect(mapConfig.defaultPolygon).toHaveLength(4)
  })

  it('produces the exact `map` rectangle string the API received before', () => {
    // getPolygonBounds passed tl as SW and br as NE; mapbox then returned
    // NE = br, NW = (tl.lng, br.lat), SW = tl, SE = (br.lng, tl.lat).
    expect(getDefaultRectangleString()).toBe(
      '[[[-74,41.6],[-83.5,41.6],[-83.5,46.8],[-74,46.8]]]'
    )
    expect(getDefaultRectangleString()).toBe(
      toRectangle(
        fakeBounds({ lat: 46.8, lng: -83.5 }, { lat: 41.6, lng: -74 })
      )
    )
  })

  it('applies the buffer the way toRectangle always did', () => {
    const sw = { lng: -79.5, lat: 43.6 }
    const ne = { lng: -79.3, lat: 43.8 }
    expect(cornersToRectangle(sw, ne, 0.1)).toBe(
      toRectangle(fakeBounds(sw, ne), 0.1)
    )
    expect(cornersToRectangle(sw, ne, 0.1)).toBe(
      '[[[-79.2,43.9],[-79.6,43.9],[-79.6,43.5],[-79.2,43.5]]]'
    )
  })

  it('round-trips API bounds through the SW/NE pair without changing them', () => {
    const apiBounds = {
      top_left: { latitude: 43.9, longitude: -79.6 },
      bottom_right: { latitude: 43.5, longitude: -79.2 }
    }
    const [sw, ne] = toBoundsPair(apiBounds)
    // toMapboxBounds: SW = (tl.lng, br.lat), NE = (br.lng, tl.lat)
    expect(sw).toEqual([-79.6, 43.5])
    expect(ne).toEqual([-79.2, 43.9])
    expect(
      cornersToApiBounds({ lng: sw[0], lat: sw[1] }, { lng: ne[0], lat: ne[1] })
    ).toEqual(apiBounds)
    expect(
      toApiBounds(
        fakeBounds({ lng: sw[0], lat: sw[1] }, { lng: ne[0], lat: ne[1] })
      )
    ).toEqual(apiBounds)
  })

  it('parses coordinates from the first query parameter like getCoords', () => {
    expect(
      getCoordsPoint(new URLSearchParams('43.653226,-79.383184&z=12'))
    ).toEqual({
      lat: 43.653226,
      lng: -79.383184
    })
    expect(getCoordsPoint(new URLSearchParams('q=toronto'))).toBeNull()
    expect(getCoordsPoint(new URLSearchParams('95,-79'))).toBeNull()
  })

  it('computes bounds at zoom around a point, centred on the point', () => {
    const map = {
      getContainer: () => ({ clientWidth: 400, clientHeight: 800 })
    } as any
    const location = { latitude: 43.65, longitude: -79.38 }
    const bounds = calcBoundsAtZoom(map, location, 14)
    const centreLat =
      (bounds.top_left.latitude + bounds.bottom_right.latitude) / 2
    const centreLng =
      (bounds.top_left.longitude + bounds.bottom_right.longitude) / 2
    expect(centreLat).toBeCloseTo(location.latitude, 10)
    expect(centreLng).toBeCloseTo(location.longitude, 10)
    expect(bounds.top_left.latitude).toBeGreaterThan(
      bounds.bottom_right.latitude
    )
    expect(bounds.top_left.longitude).toBeLessThan(
      bounds.bottom_right.longitude
    )
    // portrait container: taller than wide in degrees (before cos correction)
    expect(
      bounds.top_left.latitude - bounds.bottom_right.latitude
    ).toBeGreaterThan(
      (bounds.bottom_right.longitude - bounds.top_left.longitude) / 2
    )
  })
})
