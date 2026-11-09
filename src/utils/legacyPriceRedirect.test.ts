import {
  legacyPriceRedirect,
  parseUrlParams
} from 'app/locations/[[...slugs]]/_parsers'

const redirectFor = (slugs: string[], query = {}) => {
  const { filters } = parseUrlParams(slugs)
  return legacyPriceRedirect('/r/locations', ['toronto'], filters, query)
}

describe('legacyPriceRedirect (audit R01)', () => {
  it('keeps the budget of an old price link', () => {
    expect(redirectFor(['toronto', 'condos-below-600000'])).toBe(
      '/r/locations/toronto/condos?maxPrice=600000'
    )
  })
  it('keeps other facets and both bounds', () => {
    expect(
      redirectFor(['toronto', 'condos-above-400000-below-600000-2-bed'])
    ).toBe('/r/locations/toronto/condos-2-bed?minPrice=400000&maxPrice=600000')
  })
  it('keeps existing query values and drops page', () => {
    expect(
      redirectFor(['toronto', 'condos-below-600000'], {
        page: '2',
        maxPrice: '550000'
      })
    ).toBe('/r/locations/toronto/condos?maxPrice=550000')
  })
  it('does nothing without a price facet', () => {
    expect(redirectFor(['toronto', 'condos-2-bed'])).toBeNull()
  })
})
