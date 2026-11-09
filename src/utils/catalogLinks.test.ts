import { keepCatalogFilters } from './catalogLinks'

describe('keepCatalogFilters (audit R01)', () => {
  const path = '/r/locations/toronto/condos-2-bed'
  it('carries the facet and query to a narrower location', () => {
    expect(
      keepCatalogFilters(
        '/r/locations/toronto/scarborough',
        path,
        '?maxPrice=600000&page=3'
      )
    ).toBe('/r/locations/toronto/scarborough/condos-2-bed?maxPrice=600000')
  })
  it('leaves links alone when nothing is filtered', () => {
    expect(
      keepCatalogFilters(
        '/r/locations/toronto/scarborough',
        '/r/locations/toronto',
        ''
      )
    ).toBe('/r/locations/toronto/scarborough')
  })
  it('does not double a facet the link already has', () => {
    expect(
      keepCatalogFilters('/r/locations/toronto/scarborough/condos', path, '')
    ).toBe('/r/locations/toronto/scarborough/condos')
  })
  it('passes null through', () => {
    expect(keepCatalogFilters(null, path, '')).toBeNull()
  })
})
