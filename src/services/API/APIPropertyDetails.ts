import queryString from 'query-string'

import searchConfig from '@configs/search'

import { type ApiQueryResponse, type ApiSimilarResponse, type Property } from 'services/API'
import { getListingFields } from 'services/Search'

import APIBase from './APIBase'

class APIPropertyDetails extends APIBase {
  fetchProperty(mls: string, boardId: number): Promise<Property> {
    const searchParams = queryString.stringify({
      boardId,
      fields: 'raw'
    })
    return this.fetchJSON(`/listings/${mls}?${searchParams}`)
  }

  fetchSimilarListings(
    mls: string,
    boardId: number
  ): Promise<ApiSimilarResponse> {
    const { fields } = getListingFields()
    const searchParams = queryString.stringify({
      fields,
      boardId,
      radius: searchConfig.similarListingsRadius,
      sortBy: 'createdOnDesc',
      listPriceRange: '200000',


    })
    if (!mls || undefined == mls) {
      Promise.resolve({ listings: [] });
    }
    return this.fetchJSON(`/listings/${mls}/similar?${searchParams}`)
  }

  fetchBuilding(boardId: number, streetName: string, streetNumber: string | number, slug?: string, streetSuffix?: string, streetDirection?: string): Promise<ApiQueryResponse> {
    const searchParams = queryString.stringify({
      boardId,
      fields: 'address,mlsNumber,images,details,map',
      streetName,
      streetNumber,
      streetSuffix,
      streetDirection,
      slug
    })

    return this.fetchJSON<ApiQueryResponse>(`/listings/building?${searchParams}`)
  }

  fetchBuildingHistory(boardId: number, streetName: string, streetNumber: string | number, slug?: string, streetSuffix?: string, streetDirection?: string): Promise<ApiQueryResponse> {
    const searchParams = queryString.stringify({
      boardId,
      fields: 'address,mlsNumber,images,details,listPrice,soldPrice,listDate,soldDate,lastStatus,type,office,timestamps',
      streetName,
      streetNumber,
      streetSuffix,
      streetDirection,
      slug,
      status: ['A', 'U'],
      sortBy: 'updatedOnDesc',
      resultsPerPage: 100
    })

    return this.fetchJSON<ApiQueryResponse>(`/listings/building?${searchParams}`)
  }
}

const apiPropertyDetailsInstance = new APIPropertyDetails()
export default apiPropertyDetailsInstance
