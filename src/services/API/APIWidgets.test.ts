import { jest } from '@jest/globals'

jest.unstable_mockModule('utils/tokens', () => ({
  clearToken: jest.fn(),
  expired: jest.fn(),
  getToken: jest.fn()
}))
jest.unstable_mockModule('utils/xff', () => ({ getForwardedFrom: jest.fn() }))
process.env.NEXT_PUBLIC_API_URL = 'https://backend.example.test'
const { default: APIBase } = await import('./APIBase')
const { default: widgets } = await import('./APIWidgets')
const { default: defaultLocation } = await import('@configs/location')
const raw = jest.spyOn(APIBase.prototype, 'fetchRaw')
const payload = (data: unknown) =>
  ({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => data
  }) as unknown as Response
const requestedUrl = () => new URL(String(raw.mock.calls[0][0]), 'https://x')
beforeEach(() => {
  raw.mockReset()
  raw.mockResolvedValue(payload({ widgets: {} }))
})

// RT04: the homepage widget's label and request must describe the same
// geography. The feed covers all of Ontario, so the default request is
// unscoped and the label says Ontario; a scoped label needs a scoped request.
it('labels the homepage Insights with the scope that the default request covers', async () => {
  expect(defaultLocation.insightsScope).toBe('Ontario')
  expect(defaultLocation.defaultFilters).toEqual({})
  await widgets.fetchStats({
    ...defaultLocation.defaultFilters,
    propertyClass: ['condo']
  })
  const url = requestedUrl()
  expect(url.pathname).toBe('/stats/widgets')
  expect(url.searchParams.has('area')).toBe(false)
  expect(url.searchParams.has('city')).toBe(false)
  expect(url.searchParams.get('class')).toBe('condo')
})

it('passes an area filter through to both statistics endpoints', async () => {
  await widgets.fetchStats({ area: 'Toronto', propertyClass: ['condo'] })
  expect(requestedUrl().searchParams.get('area')).toBe('Toronto')
  raw.mockClear()
  raw.mockResolvedValue(payload({ statistics: {} }))
  await widgets.fetchHistory({
    area: 'Toronto',
    propertyClass: ['condo'],
    months: 12,
    statistics: 'sum-soldPrice,grp-mth'
  })
  const url = requestedUrl()
  expect(url.pathname).toBe('/stats/history')
  expect(url.searchParams.get('area')).toBe('Toronto')
  expect(url.searchParams.get('months')).toBe('12')
})

it('omits empty geography so location widgets stay unscoped on purpose', async () => {
  await widgets.fetchStats({ city: 'Downtown', propertyClass: 'condo' })
  const url = requestedUrl()
  expect(url.searchParams.get('city')).toBe('Downtown')
  expect(url.searchParams.has('area')).toBe(false)
  expect(url.searchParams.has('neighborhood')).toBe(false)
})
