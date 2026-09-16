import { jest } from '@jest/globals'

import { fetchFeaturedBuildings } from './fetchFeaturedBuildings'

const fetchMock = jest.fn<typeof fetch>()
beforeEach(() => {
  global.fetch = fetchMock
  fetchMock.mockReset()
  Object.defineProperty(AbortSignal, 'timeout', {
    configurable: true,
    value: () => new AbortController().signal
  })
})
it('requests the same-origin /r endpoint so localhost does not require upstream CORS', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ data: [] })
  } as Response)
  expect(await fetchFeaturedBuildings()).toEqual([])
  expect(fetchMock).toHaveBeenCalledWith(
    '/r/api/featured-buildings',
    expect.objectContaining({ signal: expect.anything() })
  )
})
it('rejects upstream proxy failures', async () => {
  fetchMock.mockResolvedValue({ ok: false } as Response)
  await expect(fetchFeaturedBuildings()).rejects.toThrow()
})
