import searchConfig from '@configs/search'

import {
  type ApiBoardArea,
  type ApiBoardCity,
  type ApiNeighborhood,
  APISearch,
  type Property
} from 'services/API'
import SearchService, { type Filters, getListingFields } from 'services/Search'

import { activeCountLimit, maxDistance } from './_constants'
import {
  byDistance,
  calculateDistance,
  extractCities,
  extractHoods,
  extractLocation
} from './_utils'

export type CatalogItem = ApiBoardCity & {
  distance?: number
}

export const fetchListings = async ({
  area = '',
  city = '',
  hood = '',
  filters = {},
  page = 1
}: {
  area?: string
  city?: string
  hood?: string
  page?: number
  filters?: Partial<Filters>
}) => {
  let listings: Property[] = []
  let count = 0
  let listPrice = null

  // When a specific neighborhood (hood) is given, the Repliers API's `neighborhood`
  // param does a fuzzy/substring match — e.g. "Allandale" also matches
  // "Allandale Centre", returning hundreds of wrong results.
  // Instead, fetch the exact MLS numbers for this neighborhood from the
  // Locations service and filter by those IDs for a precise result.
  let mlsNumbers: string[] = []
  const target = hood || city || area
  if (target) {
    try {
      const { APILocations } = await import('services/API')
      const targetCity = hood ? city : undefined
      const targetArea = (hood || city) ? area : undefined
      // Fetch exact database-backed MLS numbers for this location (area, city, or neighborhood)
      const rawEntries = await APILocations.fetchNeighborhoodListings(target, targetCity, targetArea)
      console.log('[fetchListings] target:', target, '→ rawEntries:', rawEntries)
      mlsNumbers = rawEntries
        .map((entry: string) => {
          const parts = entry.trim().split(/\s+/)
          // Format: "{address tokens...} {mlsNumber} {boardId}"
          return parts.length >= 2 ? parts[parts.length - 2] : ''
        })
        .filter(Boolean)
      console.log('[fetchListings] resolved mlsNumbers:', mlsNumbers)
    } catch (e) {
      console.error('[fetchListings] could not fetch database listings for', target, e)
    }
  }

  const fetchParams: Record<string, any> = {
    area: area || city,
    city: area ? city : '',
    mlsNumber: mlsNumbers.length > 0 ? mlsNumbers : ['NONE'],
    pageNum: page,
    resultsPerPage: searchConfig.pageSize,
    boardId: searchConfig.defaultBoardId,
    ...getListingFields(),
    ...filters
  }

  console.log('[fetchListings] final fetchParams keys:', Object.keys(fetchParams), 'mlsNumber count:', mlsNumbers.length)

  try {
    const response = await SearchService.fetch(fetchParams)
    if (response) {
      listings = response.listings
      count = response.count
      listPrice = response.statistics.listPrice
    }
  } catch (error) {
    console.error('[fetchListings] error', fetchParams, error)
  }

  return { listings, count, listPrice }
}



export const fetchLocations = async (
  city = '',
  neighborhood = ''
): Promise<ApiBoardArea[]> => {
  try {
    const { APILocations } = await import('services/API');
    const dynamicAreasData = await APILocations.fetchAreas();

    // Map the simple filtered Structure back to the complex ApiBoardArea structure 
    // that the rest of the frontend expects.
    const mapped: ApiBoardArea[] = dynamicAreasData.map((a: any) => ({
      name: a.name,
      cities: a.neighborhoods.map((name: string) => ({
        name,
        activeCount: 0,
        location: { lat: 0, lng: 0 },
        state: 'ON',
        neighborhoods: []
      }))
    }));

    // If city is specified, we behave like Repliers' search and return only that city 
    // or its neighborhoods.
    if (city) {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const target = normalize(city);
      const matchedArea = mapped.find(a => a.cities.some(c => normalize(c.name) === target));
      if (neighborhood) {
        // just return the area containing it for now, 
        // or filter the tree further if really mapping is needed.
      }
      return matchedArea ? [matchedArea] : [];
    }

    return mapped;
  } catch (error) {
    console.error(
      `[fetchLocations] error "${city}" > "${neighborhood}"\n`,
      error
    )
  }
  return []
}

const distanceMapper = (currentLocation: ApiNeighborhood) => {
  return (item: ApiNeighborhood) => {
    if (!currentLocation) {
      return item as CatalogItem
    }
    if (!item || !item.location) {
      console.error('[fetchNearbyLocations EMPTY]', item)
      return item as CatalogItem
    }
    return {
      ...item,
      distance: calculateDistance(currentLocation!.location, item.location)
    } as CatalogItem
  }
}

const distanceFilter = (item: CatalogItem) =>
  item.distance! > 0 && item.distance! < maxDistance

export const fetchNearbyLocations = async (city: string, neighborhood = '') => {
  try {
    const areas = await fetchLocations(city, neighborhood);
    const currentLocation = extractLocation(areas as any, city, neighborhood)
    const extractFunc = neighborhood ? extractHoods : extractCities

    return extractFunc(areas)
      .map(distanceMapper(currentLocation!))
      .filter(distanceFilter)
      .sort(byDistance)
  } catch (error) {
    console.error(
      `[fetchNearbyLocations ERROR] "${city}" > "${neighborhood}"\n`,
      error
    )
  }
  return []
}