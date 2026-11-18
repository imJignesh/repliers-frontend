import { jest } from '@jest/globals'

jest.unstable_mockModule('utils/tokens', () => ({
  clearToken: jest.fn(),
  expired: jest.fn(),
  getToken: jest.fn()
}))
jest.unstable_mockModule('utils/xff', () => ({ getForwardedFrom: jest.fn() }))
process.env.NEXT_PUBLIC_API_URL = 'https://backend.example.test'

const g = globalThis as any
const hadWindow = 'window' in g
if (!hadWindow) g.window = g

const fetchMock = jest.fn(async () => ({
  ok: true,
  json: async () => [{ name: 'Peel' }]
}))
const realFetch = g.fetch
g.fetch = fetchMock

const { default: APILocations } = await import('./APILocations')

afterAll(() => {
  g.fetch = realFetch
  if (!hadWindow) delete g.window
})

it('shares one area request in the browser and sends no cookies (audit 4 T05)', async () => {
  const [a, b] = await Promise.all([
    APILocations.fetchAreas(),
    APILocations.fetchAreas()
  ])
  expect(a).toEqual([{ name: 'Peel' }])
  expect(b).toBe(a)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
  expect(url).toBe('https://backend.example.test/api/areas')
  expect(init.credentials).toBeUndefined()
  expect(JSON.stringify(init.headers)).not.toMatch(/cookie|authorization/i)
})
