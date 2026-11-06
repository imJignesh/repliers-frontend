import {
  daysOnMarket as daysOnMarketValues,
  type Filters,
  soldWithin as soldWithinValues
} from 'services/Search/types'

/**
 * Audit R01 (Nov 2026): catalog filters that have no indexable path segment.
 *
 * Price used to be written into the path (`.../below-600000`), but those paths
 * are permanently redirected to the clean location hub for SEO (retired price
 * facets), so the visitor's budget was discarded. Date and year-built choices
 * were never written to the URL at all. All of them now travel in the query
 * string, which the page's canonical URL already leaves out.
 */
export const catalogQueryKeys = [
  'minPrice',
  'maxPrice',
  'minYearBuilt',
  'maxYearBuilt',
  'daysOnMarket',
  'soldWithin'
] as const

type CatalogQueryKey = (typeof catalogQueryKeys)[number]

const positiveInt = (value: string | null | undefined) => {
  if (!value || !/^\d{1,9}$/.test(value)) return undefined
  const n = Number(value)
  return n > 0 ? n : undefined
}

const year = (value: string | null | undefined) => {
  const n = positiveInt(value)
  return n && n >= 1800 && n <= new Date().getFullYear() ? n : undefined
}

/** Read the query-string filters, dropping anything malformed or reversed. */
export const parseCatalogQuery = (
  query: Record<string, string | string[] | undefined> | URLSearchParams
): Partial<Filters> => {
  const get = (key: CatalogQueryKey) => {
    const raw = query instanceof URLSearchParams ? query.get(key) : query[key]
    return Array.isArray(raw) ? raw[0] : (raw ?? undefined)
  }

  const result: Partial<Filters> = {}
  const minPrice = positiveInt(get('minPrice'))
  const maxPrice = positiveInt(get('maxPrice'))
  if (minPrice) result.minPrice = minPrice
  if (maxPrice) result.maxPrice = maxPrice
  if (minPrice && maxPrice && minPrice > maxPrice) {
    delete result.minPrice
    delete result.maxPrice
  }

  const minYearBuilt = year(get('minYearBuilt'))
  const maxYearBuilt = year(get('maxYearBuilt'))
  if (!(minYearBuilt && maxYearBuilt && minYearBuilt > maxYearBuilt)) {
    if (minYearBuilt) result.minYearBuilt = minYearBuilt
    if (maxYearBuilt) result.maxYearBuilt = maxYearBuilt
  }

  const days = get('daysOnMarket')
  if (
    days &&
    days !== 'any' &&
    (daysOnMarketValues as readonly string[]).includes(days)
  ) {
    result.daysOnMarket = days as Filters['daysOnMarket']
  }
  const sold = get('soldWithin')
  if (
    sold &&
    sold !== 'any' &&
    (soldWithinValues as readonly string[]).includes(sold)
  ) {
    result.soldWithin = sold as Filters['soldWithin']
  }
  return result
}

/** Build the query string (without "?") for the query-string filters. */
export const buildCatalogQuery = (filters: Partial<Filters>) => {
  const params = new URLSearchParams()
  catalogQueryKeys.forEach((key) => {
    const value: unknown = filters[key]
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 0 &&
      value !== 'any'
    ) {
      params.set(key, String(value))
    }
  })
  return params.toString()
}
