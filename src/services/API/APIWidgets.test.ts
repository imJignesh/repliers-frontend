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

// RT04: the homepage widget is titled "Toronto Insights", so its default
// filters must scope every statistics request to the Toronto area.
it('scopes the homepage Insights widget to Toronto', async () => {
  await widgets.fetchStats({
    ...defaultLocation.defaultFilters,
    propertyClass: ['condo']
  })
  const url = requestedUrl()
  expect(url.pathname).toBe('/stats/widgets')
  expect(url.searchParams.get('area')).toBe('Toronto')
  expect(url.searchParams.get('class')).toBe('condo')
  expect(url.searchParams.has('city')).toBe(false)
})

it('passes the area filter to the chart history endpoint', async () => {
  await widgets.fetchHistory({
    ...defaultLocation.defaultFilters,
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
