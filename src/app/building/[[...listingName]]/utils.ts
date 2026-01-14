import { cache } from 'react'

import searchConfig from '@configs/search'

import { APIPropertyDetails, type ApiQueryParams } from 'services/API'
import SearchService, { getListingFields } from 'services/Search'
import { parseSeoUrl } from 'utils/properties'

import { type Params, type SearchParams } from './types'

export const parseSlug = (params: Params, searchParams: SearchParams) => {
  const listingName = params.listingName?.[0] || ''
  const slugs = listingName.split('-')

  const boardId = Number(
    (slugs.at(-1) || '').match(/^\d{1,3}$/) &&
      !['line', 'road', 'rd', 'highway', 'hwy', 'county', 'route'].includes((slugs.at(-2) || '').toLowerCase())
      ? slugs.pop() || searchConfig.defaultBoardId
      : searchConfig.defaultBoardId
  )

  const suffixList = [
    'st',
    'street',
    'ave',
    'avenue',
    'rd',
    'road',
    'blvd',
    'boulevard',
    'dr',
    'drive',
    'crt',
    'court',
    'pl',
    'place',
    'ln',
    'lane',
    'way',
    'cir',
    'circle',
    'cres',
    'crescent',
    'ter',
    'terrace',
    'hwy',
    'highway',
    'sq',
    'square'
  ]

  let streetNumber: number = 0

  if (/^\d+$/.test(slugs[0])) {
    streetNumber = Number(slugs.shift() || 0)
  }

  // Check valid parts to build street name
  // Filter out the suffixes from end of the array if found
  // The user requested: "slug will have street offsets like st, street, ave, etc, remove that from street name"
  // Assuming strict removal from the end of the slug parts.

  if (slugs.length > 1) {
    const lastPart = slugs[slugs.length - 1].toLowerCase()
    if (suffixList.includes(lastPart)) {
      slugs.pop()
    }
  }

  const streetName = slugs
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')



  return { boardId, streetNumber, streetName }
}


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

export const fetchBuilding = cache(
  async (boardId: number, streetName: string, streetNumber: number) => {
    return await APIPropertyDetails.fetchBuilding(boardId, streetName, streetNumber)
  }
)

export const fetchNearbies = cache(async (listingName: string) => {
  const parsedAddress = parseSeoUrl(listingName)
  const { streetName, streetSuffix, city, boardId } = parsedAddress
  const query = `${streetName} ${streetSuffix}, ${city}`
  const fetchParams: Partial<ApiQueryParams> = {
    search: query,
    searchFields: 'address.streetName,address.streetSuffix,address.city',
    boardId,
    status: 'A',
    type: 'sale',
    resultsPerPage: 4,
    class: ['condo', 'residential'],
    ...getListingFields()
  }

  try {
    const response = await SearchService.fetch(fetchParams)
    return response?.listings || []
  } catch (error) {
    console.error('[fetchNearbies] error', fetchParams, error)
    return []
  }
})
