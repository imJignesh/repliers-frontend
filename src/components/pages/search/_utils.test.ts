import { type MapPosition } from 'providers/MapOptionsProvider'

import { canFetchNextPage, shouldFetchResults } from './_utils'

const position = {
  center: { lng: -79.38, lat: 43.65 } as unknown as MapPosition['center'],
  zoom: 12
}
const noPosition = { center: null, zoom: 0 }

describe('search results without a working map (audit RT05)', () => {
  it('waits for the map viewport in the normal case', () => {
    expect(
      shouldFetchResults({ mapLoaded: false, mapFailed: false, position })
    ).toBe(false)
    expect(
      shouldFetchResults({
        mapLoaded: true,
        mapFailed: false,
        position: noPosition
      })
    ).toBe(false)
    expect(
      shouldFetchResults({ mapLoaded: true, mapFailed: false, position })
    ).toBe(true)
  })

  it('fetches results anyway when the map failed to initialize', () => {
    expect(
      shouldFetchResults({
        mapLoaded: false,
        mapFailed: true,
        position: noPosition
      })
    ).toBe(true)
  })

  it('lets pagination continue without bounds only when the map failed or in grid layout', () => {
    expect(
      canFetchNextPage({ layout: 'map', hasBounds: false, mapFailed: false })
    ).toBe(false)
    expect(
      canFetchNextPage({ layout: 'map', hasBounds: true, mapFailed: false })
    ).toBe(true)
    expect(
      canFetchNextPage({ layout: 'map', hasBounds: false, mapFailed: true })
    ).toBe(true)
    expect(
      canFetchNextPage({ layout: 'grid', hasBounds: false, mapFailed: false })
    ).toBe(true)
  })
})
