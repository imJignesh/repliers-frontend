import { getPageHref } from './CatalogPagination'

// Technical audit TA04: page numbers are real links with stable hrefs.
describe('getPageHref', () => {
  it('drops page for page 1 so it matches the canonical URL', () => {
    expect(getPageHref('/r/locations/toronto', 'page=3', 1)).toBe('/r/locations/toronto')
  })
  it('sets page and keeps the other query params', () => {
    expect(getPageHref('/r/locations/toronto', 'maxPrice=600000', 2)).toBe(
      '/r/locations/toronto?maxPrice=600000&page=2'
    )
  })
  it('applies extra params such as the buildings view', () => {
    expect(getPageHref('/r/locations/toronto', '', 3, { type: 'building' })).toBe(
      '/r/locations/toronto?type=building&page=3'
    )
  })
})
