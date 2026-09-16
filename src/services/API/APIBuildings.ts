import apiConfig from '@configs/api'

import APIBase from './APIBase'

export type FeaturedBuilding = {
  id?: number
  slug: string
  name: string
  address?: string
  cover_photo_url?: string
  listing_count?: number
}

class APIBuildings extends APIBase {
  async fetchFeatured(): Promise<FeaturedBuilding[]> {
    const response = await this.fetchRaw('/buildings?tag=featured', {
      signal: AbortSignal.timeout(apiConfig.apiRequestTimeout)
    })
    if (
      !response.ok ||
      !response.headers.get('content-type')?.includes('application/json')
    ) {
      throw new Error('Featured buildings request failed')
    }
    const body = await response.json()
    if (!Array.isArray(body?.data)) {
      throw new Error('Invalid featured buildings response')
    }
    if (
      !body.data.every(
        (building: FeaturedBuilding) =>
          building &&
          typeof building.name === 'string' &&
          typeof building.slug === 'string' &&
          /^[a-z0-9-]+$/i.test(building.slug)
      )
    ) {
      throw new Error('Invalid featured building')
    }
    return body.data.slice(0, 8)
  }
}

export default new APIBuildings()
