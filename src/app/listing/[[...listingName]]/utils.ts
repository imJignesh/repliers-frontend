import { cache } from 'react'

import routes from '@configs/routes'
import searchConfig from '@configs/search'

import { type Property } from 'services/API'
import { APIPropertyDetails, type ApiQueryParams } from 'services/API'
import SearchService, { getListingFields } from 'services/Search'
import { parseSeoUrl } from 'utils/properties'
import { getSeoUrl } from 'utils/properties/seo'

import { type Params, type SearchParams } from './types'

export const parseParams = (params: Params, searchParams: SearchParams) => {
  const listingName = params.listingName?.[0] || ''
  const slugs = listingName.split('-')

  const boardId = Number(
    (slugs.at(-1) || '').match(/^\d{1,3}$/)
      ? slugs.pop() || searchConfig.defaultBoardId
      : searchConfig.defaultBoardId
  )

  const listingId =
    slugs.pop() ||
    searchParams.listingId ||
    searchParams.propertyId ||
    searchParams.mlsNumber ||
    searchParams.id ||
    ''

  return { listingName, listingId, boardId }
}

export const fetchProperty = cache(
  async (listingId: string, boardId: number) => {
    return await APIPropertyDetails.fetchProperty(listingId, boardId)
  }
)

export const fetchNearbies = cache(async (listingName: string) => {
  const parsedAddress = parseSeoUrl(listingName)
  const { city, boardId, mlsNumber } = parsedAddress

  let neighborhood = ''
  let finalCity = city

  if (mlsNumber) {
    try {
      const property = await fetchProperty(mlsNumber, boardId)
      if (property && property.address) {
        neighborhood = property.address.neighborhood || ''
        finalCity = property.address.city || finalCity
      }
    } catch (error) {
      console.error(
        '[fetchNearbies] fetchProperty failed, using URL parsed address',
        error
      )
    }
  }

  const fetchParams: Partial<ApiQueryParams> = {
    boardId,
    status: 'A',
    type: 'sale',
    resultsPerPage: 4,
    class: ['condo', 'residential'],
    ...getListingFields()
  }

  if (neighborhood) {
    fetchParams.neighborhood = neighborhood
    fetchParams.city = finalCity
  } else if (finalCity) {
    fetchParams.city = finalCity
  }

  try {
    let response = await SearchService.fetch(fetchParams)

    // Fallback: if neighborhood search returned no results, try search by city only
    if (
      neighborhood &&
      (!response?.listings || response.listings.length === 0)
    ) {
      const cityParams = { ...fetchParams }
      delete cityParams.neighborhood
      response = await SearchService.fetch(cityParams)
    }

    return response?.listings || []
  } catch (error) {
    console.error('[fetchNearbies] error', fetchParams, error)
    return []
  }
})

/**
 * The single canonical path for a listing, or null when it cannot be derived
 * safely.
 *
 * Every alternate spelling of a listing URL (stale city label, apostrophe
 * variant, a display label that used to leak punctuation) has to collapse onto
 * exactly one path in one 301 hop. That path is whatever getSeoUrl() produces,
 * because getSeoUrl() is also what writes the <link rel="canonical"> tag -- if
 * this function and that tag ever disagreed we would be pointing Google at a
 * URL that itself redirects.
 *
 * The boardId suffix is intentionally dropped: the listings endpoint resolves
 * purely by MLS number and ignores boardId, so keeping it would preserve a
 * second indexable spelling of the same page for no behavioural gain.
 */
export const getCanonicalPath = (
  property: Partial<Property>,
  listingName: string
): string | null => {
  if (!listingName || !property?.mlsNumber) return null

  const canonicalPath = getSeoUrl(property, { excludeQuery: true })
  const canonicalSlug = canonicalPath.slice(routes.listing.length + 1)
  if (!canonicalSlug) return null

  // Loop guard. The target has to parse back to the listing we are already
  // holding; if it does not (a 1-3 digit MLS number, for instance, which
  // parseParams would read as a boardId) a redirect would bounce forever.
  const reparsed = parseParams({ listingName: [canonicalSlug] }, {})
  if (reparsed.listingId !== String(property.mlsNumber)) return null

  return canonicalPath
}
