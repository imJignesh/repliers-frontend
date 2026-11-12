import { type Filters } from 'services/Search'
import { processParams } from 'services/Search/adapter'

import { hasNarrowingFilters } from './catalogQuery'

/** Listing filters the building list endpoints accept (same names as the listing search). */
export const BUILDING_FILTER_KEYS = [
  'minPrice',
  'maxPrice',
  'minBeds',
  'maxBeds',
  'minBaths',
  'maxBaths',
  'minParkingSpaces',
  'minGarageSpaces',
  'minListDate',
  'maxListDate',
  'minSoldDate',
  'maxSoldDate',
  'minYearBuilt',
  'maxYearBuilt',
  'type'
] as const

/**
 * Query string for the Buildings tab: the visitor's search filters turned into
 * listing-search parameters (beds, price, dates, year built, sale or lease),
 * so the list keeps only buildings with a matching listing. Empty when the
 * visitor has not narrowed the search, so the plain building list is used.
 */
export const buildingFilterQuery = (
  filters: Partial<Filters> | null | undefined
): string => {
  if (!hasNarrowingFilters(filters as Record<string, unknown>)) return ''
  const params = (processParams(filters as any) as any)?.get || {}
  const query = new URLSearchParams()
  BUILDING_FILTER_KEYS.forEach((key) => {
    const value = params[key]
    if (value === undefined || value === null || value === '') return
    ;(Array.isArray(value) ? value : [value]).forEach((v) =>
      query.append(key, String(v))
    )
  })
  query.sort()
  return query.toString()
}
