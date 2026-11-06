'use client'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { type Position } from 'geojson'

import { defaultFilters } from '@configs/filters'

import { type ApiQueryResponse, type Property } from 'services/API'
import SearchService, { type Filters } from 'services/Search'
import { sortPropertyScoredImages } from 'utils/properties'
import { sameFilters, stableKey } from 'utils/filterEquality'

import { type SavedResponse, type SearchContextType } from './types'

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const emptySavedResponse = {
  count: 0,
  page: 0,
  pages: 0,
  list: [],
  clusters: [],
  statistics: {}
}

const SearchProvider = ({
  filters,
  polygon,
  syncFilters = false,
  children
}: {
  filters?: Filters
  polygon?: Position[]
  syncFilters?: boolean
  children?: React.ReactNode
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)
  const [saved, setSaved] = useState<SavedResponse>(emptySavedResponse)
  const [multiUnits, saveMultiUnits] = useState<Property[]>([])

  const [searchFilters, updateFilters] = useState(filters || defaultFilters)

  const clearResults = useCallback(() => {
    // Invalidate in-flight requests before a new filter can label old results.
    requestId.current += 1
    setSaved(emptySavedResponse)
    saveMultiUnits([])
    setError(null)
    setLoading(true)
  }, [])

  // Latest committed filters, so setFilters can compare synchronously.
  const filtersRef = useRef(searchFilters)
  filtersRef.current = searchFilters

  const setFilters = (next: React.SetStateAction<Filters>) => {
    const value = typeof next === 'function' ? next(filtersRef.current) : next
    // Audit R01: an unchanged Apply/Reset used to clear the results and wait
    // for a navigation that never came, leaving blank cards.
    if (sameFilters(value, filtersRef.current)) return
    filtersRef.current = value
    clearResults()
    updateFilters(value)
  }

  // Pages whose filters come from the URL (catalog) pass syncFilters so that
  // Back/Forward and shared links replace the in-memory filters instead of
  // the stale state pushing the old URL back.
  const filtersKey = syncFilters ? stableKey(filters || {}) : ''
  useEffect(() => {
    if (!syncFilters || !filters) return
    if (sameFilters(filters, filtersRef.current)) return
    filtersRef.current = filters
    updateFilters(filters)
  }, [filtersKey])

  const [searchPolygon, setPolygon] = useState<Position[] | null>(
    polygon || null
  )

  const setFilter = (key: keyof Filters, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const addFilters = (newFilters: Filters) =>
    setFilters((prev) => ({ ...prev, ...newFilters }))

  const removeFilter = (key: keyof Filters) =>
    setFilters((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = prev
      return rest
    })

  const removeFilters = (keys: (keyof Filters)[]) =>
    setFilters((prev) => {
      const newFilters = { ...prev }
      keys.forEach((key) => {
        delete newFilters[key]
      })
      return newFilters
    })

  // Reset clears the search criteria but keeps the place being browsed.
  const resetFilters = () =>
    setFilters((prev) => ({
      ...defaultFilters,
      ...(prev.area !== undefined ? { area: prev.area } : {}),
      ...(prev.city !== undefined ? { city: prev.city } : {}),
      ...(prev.neighborhood !== undefined
        ? { neighborhood: prev.neighborhood }
        : {})
    }))

  const clearPolygon = () => setPolygon(null)

  const save = (response: ApiQueryResponse) => {
    const { listings, count, page, numPages, aggregates, statistics } = response

    const remappedResponse: SavedResponse = {
      page,
      pages: numPages,
      count,
      statistics,
      list: listings.map(sortPropertyScoredImages),
      clusters: aggregates?.map?.clusters || []
    }

    setSaved(remappedResponse)
    return remappedResponse
  }

  const search = async (params: any) => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const response = await SearchService.fetch(params, {
        cancelGroup: 'search'
      })
      if (
        !response ||
        !Array.isArray(response.listings) ||
        !Number.isFinite(response.count)
      ) {
        throw new Error('Invalid search response')
      }
      // Do not label active properties as sold if an older API ignores status.
      // Reject the whole response: filtering one page would invent a total.
      if (
        params.listingStatus === 'sold' &&
        response?.listings.some(
          (listing) => listing.status !== 'U' || listing.lastStatus !== 'Sld'
        )
      ) {
        throw new Error('Search response does not match the selected status')
      }
      // Abort alone is insufficient: a response may already be completing.
      return id === requestId.current ? response : undefined
    } catch {
      if (id === requestId.current) {
        setSaved({ ...emptySavedResponse, page: 1 })
        setError('Unable to load listings. Please try again.')
      }
      return undefined
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  // special effect to clear up the grid and show loading placeholders
  // instead of "No Results" message
  useEffect(() => {
    if (filters?.imageSearchItems) setSaved({ ...saved, page: 0 })
  }, [filters])

  useEffect(
    () => () => {
      requestId.current += 1
    },
    []
  )

  const contextValue = useMemo(
    () => ({
      loading,
      error,
      clearResults,
      setLoading,
      filters: searchFilters,
      setFilter,
      setFilters,
      addFilters,
      removeFilter,
      removeFilters,
      resetFilters,
      search,
      save,
      ...saved, // destructured saved object shorthands
      polygon: searchPolygon,
      setPolygon,
      clearPolygon,
      multiUnits,
      saveMultiUnits,
      clearMultiUnits: () => saveMultiUnits([])
    }),
    [searchFilters, searchPolygon, loading, error, saved, multiUnits]
  )

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  )
}
export default SearchProvider

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw Error('useSearch must be used within an SearchProvider')
  }
  return context
}
