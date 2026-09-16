import { jest } from '@jest/globals'

jest.unstable_mockModule('mapbox-gl', () => ({
  default: {
    LngLat: class {
      constructor(
        public lng: number,
        public lat: number
      ) {}
    }
  }
}))
jest.unstable_mockModule('services/Search', () => ({
  getNonDefaultFilters: () => ({})
}))
jest.unstable_mockModule('utils/properties', () => ({
  getMakiSymbol: () => ''
}))
jest.unstable_mockModule('utils/formatters', () => ({
  toSafeNumber: (value: unknown) => Number(value)
}))
const { getCoords, formatCoords } = await import('./map')

describe('map URL coordinates', () => {
  it('preserves western longitude when a Sold URL is reloaded', () => {
    const coordinates = getCoords(
      new URLSearchParams('44.257445,-78.750000&z=5.538546&listingStatus=sold')
    )!
    expect(coordinates.lng).toBe(-78.75)
    expect(coordinates.lat).toBe(44.257445)
    expect(formatCoords(coordinates)).toBe('44.257445,-78.750000')
  })
  it('accepts zero and southern coordinates without changing signs', () => {
    expect(getCoords(new URLSearchParams('0,0'))?.lng).toBe(0)
    expect(getCoords(new URLSearchParams('-33.8,151.2'))?.lat).toBe(-33.8)
  })
  it.each(['q=toronto', '95,-78', '44,181', '44..2,-78'])(
    'ignores invalid coordinates: %s',
    (query) => {
      expect(getCoords(new URLSearchParams(query))).toBeNull()
    }
  )
})
