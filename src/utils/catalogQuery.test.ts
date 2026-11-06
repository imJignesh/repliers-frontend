import { sameFilters } from './filterEquality'
import { getYearBuiltError } from './yearBuilt'

import { buildCatalogQuery, parseCatalogQuery } from './catalogQuery'

describe('catalog query filters (audit R01)', () => {
  it('round-trips price, year built and days on market', () => {
    const qs = buildCatalogQuery({
      minPrice: 650000,
      maxPrice: 700000,
      minYearBuilt: 2020,
      daysOnMarket: 'lastWeek',
      minBeds: 2 // path facet, not part of the query
    })
    expect(qs).toBe(
      'minPrice=650000&maxPrice=700000&minYearBuilt=2020&daysOnMarket=lastWeek'
    )
    expect(parseCatalogQuery(new URLSearchParams(qs))).toEqual({
      minPrice: 650000,
      maxPrice: 700000,
      minYearBuilt: 2020,
      daysOnMarket: 'lastWeek'
    })
  })

  it('omits empty and "any" values', () => {
    expect(buildCatalogQuery({ maxPrice: 0, daysOnMarket: 'any' })).toBe('')
  })

  it('drops malformed, impossible and reversed values', () => {
    expect(
      parseCatalogQuery({
        maxPrice: 'abc',
        minYearBuilt: '2099',
        daysOnMarket: 'forever'
      })
    ).toEqual({})
    expect(
      parseCatalogQuery({ minPrice: '900000', maxPrice: '600000' })
    ).toEqual({})
    expect(
      parseCatalogQuery({ minYearBuilt: '2020', maxYearBuilt: '1990' })
    ).toEqual({})
  })
})

describe('sameFilters', () => {
  it('treats empty values as no restriction', () => {
    expect(sameFilters({ minBeds: 0, maxPrice: undefined }, {})).toBe(true)
    expect(
      sameFilters(
        { listingType: 'condo', minBeds: 2 },
        { minBeds: 2, listingType: 'condo' }
      )
    ).toBe(true)
    expect(sameFilters({ maxPrice: 600000 }, {})).toBe(false)
  })
})

describe('getYearBuiltError', () => {
  it('accepts empty and valid ranges', () => {
    expect(getYearBuiltError('', '')).toBeNull()
    expect(getYearBuiltError('1990', '2020')).toBeNull()
  })
  it('rejects future, malformed and reversed years', () => {
    expect(getYearBuiltError('2099', '')).toMatch(/Enter a year/)
    expect(getYearBuiltError('19x0', '')).toMatch(/Enter a year/)
    expect(getYearBuiltError('2020', '1900')).toMatch(/must not be after/)
  })
})
