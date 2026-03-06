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
      !['line', 'road', 'rd', 'st', 'ave', 'highway', 'hwy', 'county', 'route'].includes((slugs.at(-2) || '').toLowerCase())
      ? slugs.pop() || searchConfig.defaultBoardId
      : searchConfig.defaultBoardId
  )

  const realSuffixes = [
    'st', 'street', 'ave', 'avenue', 'rd', 'road', 'blvd', 'boulevard', 'dr', 'drive',
    'crt', 'court', 'pl', 'place', 'ln', 'lane', 'way', 'cir', 'circle', 'cres', 'crescent',
    'ter', 'terrace', 'hwy', 'highway', 'sq', 'square', 'est', 'estate', 'quay', 'path',
    'gate', 'mews', 'grove', 'row', 'gdns', 'gardens', 'pky', 'parkway', 'esplanade', 'walk', 'trail'
  ]

  const directions = ['n', 's', 'e', 'w', 'north', 'south', 'east', 'west']

  let streetNumber: string = ''
  let streetName: string = ''
  let streetSuffix: string = ''
  let streetDirection: string = ''

  // Look for all valid address patterns: [NUMBER] [NAME] [SUFFIX]
  const candidates: any[] = [];
  for (let i = 0; i < slugs.length; i++) {
    // If it's a number (allowing ranges and letters like 326B or 1159-1173)
    if (/^\d+[a-z]*([-\/]\d+[a-z]*)?$/i.test(slugs[i])) {
      // Look forward for a suffix
      for (let j = i + 1; j < slugs.length; j++) {
        const potentialSuffix = slugs[j].toLowerCase()
        if (realSuffixes.includes(potentialSuffix)) {
          // Found a potential match!
          const numStr = slugs[i]
          const nameParts = slugs.slice(i + 1, j)

          // Filter out candidates where the street name contains something that looks like a street number
          // This avoids "Bathurst Condos 7420 Bathurst"
          const hasInnerNumber = nameParts.some(part => /^\d+$/.test(part));

          if (nameParts.length > 0 && !hasInnerNumber) {
            let sDir = '';
            const nextPart = slugs[j + 1]?.toLowerCase()
            if (nextPart && directions.includes(nextPart)) {
              sDir = nextPart
            }

            candidates.push({
              boardId,
              streetNumber: numStr,
              streetName: nameParts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
              streetSuffix: slugs[j],
              streetDirection: sDir,
              slug: listingName,
              score: nameParts.length, // shorter is better?
              index: i // Capture the index of the street number
            });
          }
        }
      }
    }
  }

  if (candidates.length > 0) {
    // Sort logic:
    // 1. Prefer candidates found later in the slug (higher index).
    //    Why? In "7420-bathurst-condos-7420-bathurst-st-thornhill", the second occurrence
    //    is the real address ("7420 Bathurst St"), while the first one captures the project name prefix.
    candidates.sort((a, b) => b.index - a.index);
    return candidates[0];
  }

  // Fallback for simple slugs or slugs without clear suffix patterns
  const numberIndex = slugs.findIndex((s) => /^\d+[a-z]*$/i.test(s))
  if (numberIndex !== -1) {
    const numStr = slugs[numberIndex]
    streetNumber = numStr

    const nameParts = slugs.slice(numberIndex + 1)
    let endOfNameIndex = nameParts.length

    for (let i = 0; i < nameParts.length; i++) {
      const part = nameParts[i].toLowerCase()
      if (realSuffixes.includes(part)) {
        streetSuffix = part
        endOfNameIndex = i
        const nextPart = nameParts[i + 1]?.toLowerCase()
        if (nextPart && directions.includes(nextPart)) {
          streetDirection = nextPart
        }
        break
      } else if (directions.includes(part)) {
        streetDirection = part
        endOfNameIndex = i
        break
      }
    }

    streetName = nameParts
      .slice(0, endOfNameIndex)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ')
  } else {
    streetName = slugs
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ')
  }

  return { boardId, streetNumber, streetName, streetSuffix, streetDirection, slug: listingName }
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
  async (boardId: number, streetName: string, streetNumber: string | number, slug?: string, streetSuffix?: string, streetDirection?: string) => {
    return await APIPropertyDetails.fetchBuilding(boardId, streetName, streetNumber, slug, streetSuffix, streetDirection)
  }
)

export const fetchBuildingHistory = cache(
  async (boardId: number, streetName: string, streetNumber: string | number, slug?: string, streetSuffix?: string, streetDirection?: string) => {
    return await APIPropertyDetails.fetchBuildingHistory(boardId, streetName, streetNumber, slug, streetSuffix, streetDirection)
  }
)

export const fetchNearbies = cache(async (listingName: string) => {
  if (!listingName) return []

  const parsedAddress = parseSeoUrl(listingName)
  const { streetName, streetSuffix, city, boardId } = parsedAddress

  // Use a more robust query construction
  let query = ''
  let searchFields = 'address.streetName,address.streetSuffix,address.city'

  if (streetName && city) {
    query = `${streetName}${streetSuffix ? ' ' + streetSuffix : ''}, ${city}`
  } else if ((parsedAddress as any).address) {
    query = (parsedAddress as any).address
    // If we only have a general address string, search more broadly
    searchFields = 'address.streetName,address.streetSuffix,address.city,address.neighborhood'
  } else {
    // Last resort: use the slug itself as a search query
    query = listingName.replace(/-/g, ' ')
    searchFields = 'address.streetName,address.streetSuffix,address.city,address.neighborhood'
  }

  const fetchParams: Partial<ApiQueryParams> = {
    search: query,
    searchFields,
    boardId: boardId || searchConfig.defaultBoardId,
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
    console.error('[fetchNearbies] error', { listingName, query, fetchParams }, error)
    return []
  }
})
