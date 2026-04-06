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

  const fetchParams = {
    // area: city,
    area,
    city,
    neighborhood: hood,
    // status: 'A',
    pageNum: page,
    resultsPerPage: searchConfig.pageSize,
    boardId: searchConfig.defaultBoardId,
    ...getListingFields(),
    ...filters
  }

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
