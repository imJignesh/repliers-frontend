import { cache } from 'react'

import searchConfig from '@configs/search'

import { APIPropertyDetails, type ApiQueryParams } from 'services/API'
import SearchService, { getListingFields } from 'services/Search'
import { parseSeoUrl } from 'utils/properties'

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
      console.error('[fetchNearbies] fetchProperty failed, using URL parsed address', error)
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
    if (neighborhood && (!response?.listings || response.listings.length === 0)) {
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
