import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { jest } from '@jest/globals'

import type { ApiQueryResponse } from 'services/API'

import type { SearchContextType } from './types'

const fetchMock = jest.fn<() => Promise<ApiQueryResponse>>()
jest.unstable_mockModule('services/Search', () => ({
  default: { fetch: fetchMock }
}))
jest.unstable_mockModule('utils/properties', () => ({
  sortPropertyScoredImages: (property: unknown) => property
}))

const { default: SearchProvider, useSearch } = await import('./SearchProvider')

const response = (count = 0) =>
  ({
    count,
    page: 1,
    numPages: count ? 1 : 0,
    statistics: {},
    listings: count ? [{ mlsNumber: 'ACTIVE', lastStatus: 'New' }] : []
  }) as unknown as ApiQueryResponse

const deferred = () => {
  let resolve!: (value: ApiQueryResponse) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<ApiQueryResponse>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

let state: SearchContextType
let root: Root
let container: HTMLDivElement
Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true })
const Consumer = () => {
  state = useSearch()
  return null
}

beforeEach(() => {
  fetchMock.mockReset()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() =>
    root.render(
      <SearchProvider>
        <Consumer />
      </SearchProvider>
    )
  )
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

it('clears active cards, count and multi-unit results as soon as Sold is selected', () => {
  act(() => {
    state.save(response(1))
    state.saveMultiUnits(response(1).listings)
  })
  act(() => state.setFilter('listingStatus', 'sold'))
  expect(state.filters.listingStatus).toBe('sold')
  expect(state.list).toEqual([])
  expect(state.multiUnits).toEqual([])
  expect(state.count).toBe(0)
  expect(state.page).toBe(0)
  expect(state.loading).toBe(true)
})

it('ignores an old response and keeps loading until the latest search completes', async () => {
  const old = deferred(),
    latest = deferred()
  fetchMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise)
  let first!: ReturnType<SearchContextType['search']>
  let second!: ReturnType<SearchContextType['search']>
  act(() => {
    first = state.search({ listingStatus: 'active' })
  })
  act(() => {
    state.setFilter('listingStatus', 'sold')
    second = state.search({ listingStatus: 'sold' })
  })
  await act(async () => {
    old.resolve(response(1))
    expect(await first).toBeUndefined()
  })
  expect(state.loading).toBe(true)
  await act(async () => {
    latest.resolve(response())
    const result = await second
    if (result) state.save(result)
  })
  expect(state.loading).toBe(false)
  expect(state.error).toBeNull()
  expect(state.count).toBe(0)
  expect(state.page).toBe(1)
  expect(state.list).toEqual([])
})

it('does not let a late cancellation clear a newer request loading state', async () => {
  const old = deferred(),
    latest = deferred()
  fetchMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise)
  let first!: ReturnType<SearchContextType['search']>
  let second!: ReturnType<SearchContextType['search']>
  act(() => {
    first = state.search({})
    second = state.search({})
  })
  await act(async () => {
    old.reject('cancelled')
    await first
  })
  expect(state.loading).toBe(true)
  expect(state.error).toBeNull()
  await act(async () => {
    latest.resolve(response())
    await second
  })
})

it('shows a recoverable error instead of stale results or a false zero result', async () => {
  act(() => state.save(response(1)))
  fetchMock.mockRejectedValueOnce(new Error('network failed'))
  await act(async () => {
    await state.search({ listingStatus: 'sold' })
  })
  expect(state.error).toBe('Unable to load listings. Please try again.')
  expect(state.loading).toBe(false)
  expect(state.list).toEqual([])
  fetchMock.mockResolvedValueOnce(response(1))
  await act(async () => {
    const result = await state.search({ listingStatus: 'active' })
    if (result) state.save(result)
  })
  expect(state.error).toBeNull()
  expect(state.count).toBe(1)
})

it('invalidates a request immediately on a filter change, before the next request starts', async () => {
  const old = deferred()
  fetchMock.mockReturnValueOnce(old.promise)
  let first!: ReturnType<SearchContextType['search']>
  act(() => {
    first = state.search({})
  })
  act(() => state.addFilters({ listingStatus: 'sold' }))
  await act(async () => {
    old.resolve(response(1))
    expect(await first).toBeUndefined()
  })
  expect(state.loading).toBe(true)
  expect(state.list).toEqual([])
})

it('rejects active cards returned by an API that ignores the Sold filter', async () => {
  fetchMock.mockResolvedValueOnce(response(1))
  await act(async () => {
    const result = await state.search({ listingStatus: 'sold' })
    expect(result).toBeUndefined()
  })
  expect(state.list).toEqual([])
  expect(state.error).toBe('Unable to load listings. Please try again.')
})

it('ends loading with an error when the API returns invalid JSON data', async () => {
  fetchMock.mockResolvedValueOnce(null as unknown as ApiQueryResponse)
  await act(async () => {
    await state.search({ listingStatus: 'sold' })
  })
  expect(state.loading).toBe(false)
  expect(state.error).toBe('Unable to load listings. Please try again.')
})
