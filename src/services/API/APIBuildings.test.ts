import { jest } from '@jest/globals'

jest.unstable_mockModule('utils/tokens', () => ({
  clearToken: jest.fn(),
  expired: jest.fn(),
  getToken: jest.fn()
}))
jest.unstable_mockModule('utils/xff', () => ({ getForwardedFrom: jest.fn() }))
process.env.NEXT_PUBLIC_API_URL = 'https://backend.example.test'
delete process.env.NEXT_PUBLIC_PRECONDO_URL
const { default: APIBase } = await import('./APIBase')
const { default: buildings } = await import('./APIBuildings')
const raw = jest.spyOn(APIBase.prototype, 'fetchRaw')
const payload = (data: unknown, ok = true, contentType = 'application/json') =>
  ({
    ok,
    headers: { get: () => contentType },
    json: async () => data
  }) as unknown as Response
beforeEach(() => {
  raw.mockReset()
  Object.defineProperty(AbortSignal, 'timeout', {
    configurable: true,
    value: () => new AbortController().signal
  })
})
it('uses the configured API origin without the optional precondo variable and caps cards at eight', async () => {
  expect(buildings.getAbsoluteUrl('/buildings?tag=featured')).toBe(
    'https://backend.example.test/api/buildings?tag=featured'
  )
  raw.mockResolvedValue(
    payload({
      data: Array.from({ length: 12 }, (_, id) => ({
        id,
        slug: `building-${id}`,
        name: `Building ${id}`
      }))
    })
  )
  expect(await buildings.fetchFeatured()).toHaveLength(8)
  expect(raw).toHaveBeenCalledWith(
    '/buildings?tag=featured',
    expect.objectContaining({ signal: expect.anything() })
  )
})
it('accepts an empty result', async () => {
  raw.mockResolvedValue(payload({ data: [] }))
  expect(await buildings.fetchFeatured()).toEqual([])
})
it.each([
  payload({}, false),
  payload('<html>error</html>', true, 'text/html'),
  payload({ data: {} }),
  payload({ data: [{ name: 'Bad', slug: '../bad' }] })
])('rejects failed or malformed responses', async (response) => {
  raw.mockResolvedValue(response)
  await expect(buildings.fetchFeatured()).rejects.toThrow()
})
