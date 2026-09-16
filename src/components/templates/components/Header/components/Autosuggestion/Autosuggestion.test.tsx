import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { jest } from '@jest/globals'

const fetchSuggestions = jest.fn<(query: string) => Promise<object>>()
let input: (event: null, value: string, reason: string) => void
let options: Array<{ type: string; source?: { mlsNumber: string } }>
jest.unstable_mockModule('@mui/material', () => ({
  Autocomplete: (props: {
    onInputChange: typeof input
    options: typeof options
  }) => {
    input = props.onInputChange
    options = props.options
    return null
  },
  Stack: ({ children }: { children: React.ReactNode }) => children,
  Button: () => null,
  CircularProgress: () => null,
  Skeleton: () => null,
  TextField: () => null
}))
jest.unstable_mockModule('@icons/IcoSearch', () => ({ default: () => null }))
jest.unstable_mockModule('@configs/map', () => ({
  default: { defaultAddressZoom: 12 }
}))
jest.unstable_mockModule('utils/urls', () => ({ getCatalogUrl: jest.fn() }))
jest.unstable_mockModule('./utils', () => ({
  getAddressLabel: jest.fn(),
  getAreaLabel: jest.fn(),
  getBuildingLabel: jest.fn(),
  getListingLabel: jest.fn(),
  removeQueryParam: jest.fn(),
  updateQueryParam: jest.fn()
}))
jest.unstable_mockModule('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams()
}))
jest.unstable_mockModule('services/API', () => ({
  APILocations: { fetchAutosuggestions: fetchSuggestions }
}))
jest.unstable_mockModule('services/Map', () => ({ default: {}, MapSearch: {} }))
jest.unstable_mockModule('providers/LocationsProvider', () => ({
  useLocations: () => ({ searchLocations: async () => [] })
}))
jest.unstable_mockModule('hooks/useClientSide', () => ({ default: () => true }))
jest.unstable_mockModule('utils/map', () => ({
  getZoom: () => 8,
  getCoords: () => null,
  calcBoundsAtZoom: jest.fn(),
  getMapUrl: jest.fn(),
  toMapboxBounds: jest.fn(),
  toMapboxPoint: jest.fn()
}))
jest.unstable_mockModule('utils/properties', () => ({ getSeoUrl: jest.fn() }))
for (const name of [
  'OptionAddress',
  'OptionArea',
  'OptionBuilding',
  'OptionListing',
  'OptionLoader'
]) {
  jest.unstable_mockModule(`./components/${name}`, () => ({
    default: () => null
  }))
}
const { default: Autosuggestion } = await import('./Autosuggestion')
const deferred = () => {
  let resolve!: (value: object) => void
  const promise = new Promise<object>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
let root: Root
let container: HTMLDivElement
Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true })
beforeEach(() => {
  jest.useFakeTimers()
  fetchSuggestions.mockReset()
  container = document.createElement('div')
  root = createRoot(container)
  act(() => root.render(<Autosuggestion />))
})
afterEach(() => {
  act(() => root.unmount())
  jest.useRealTimers()
})
const type = async (query: string) => {
  act(() => input(null, query, 'input'))
  await act(async () => {
    jest.advanceTimersByTime(200)
  })
}
it('keeps the latest suggestions when an older search completes last', async () => {
  const older = deferred(),
    latest = deferred()
  fetchSuggestions
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(latest.promise)
  await type('Toronto')
  await type('Ottawa')
  await act(async () => latest.resolve({ listings: [{ mlsNumber: 'LATEST' }] }))
  expect(options.map((o) => o.source?.mlsNumber)).toEqual(['LATEST'])
  await act(async () => older.resolve({ listings: [{ mlsNumber: 'OLD' }] }))
  expect(options.map((o) => o.source?.mlsNumber)).toEqual(['LATEST'])
})
it('does not repopulate suggestions after the input is cleared', async () => {
  const pending = deferred()
  fetchSuggestions.mockReturnValueOnce(pending.promise)
  await type('Toronto')
  act(() => input(null, '', 'clear'))
  await act(async () => pending.resolve({ listings: [{ mlsNumber: 'OLD' }] }))
  expect(options).toEqual([])
})
