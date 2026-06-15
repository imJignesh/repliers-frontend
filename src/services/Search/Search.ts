import mapConfig from '@configs/map'

import { type ApiBounds, type ApiQueryParams, APISearch } from 'services/API'
import MapService, { MapSearch } from 'services/Map'
import { processParams } from 'services/Search/adapter'
import { calcBoundsAtZoom, calcZoomLevel } from 'utils/map'

import { getDefaultRectangle, getListingFields } from './params'
import { type Filters } from './types'

const { defaultAddressZoom, defaultAreaZoom, fallbackAreaZoom } = mapConfig

class SearchService {
  private abortController: AbortController | undefined

  private abortControllers = new Map<string, AbortController>()

  private disabled = false

  disableRequests() {
    this.disabled = true
    if (this.abortController) {
      this.abortController.abort('disableRequests')
    }
    this.abortControllers.forEach((controller) => {
      controller.abort('disableRequests')
    })
    this.abortControllers.clear()
  }

  enableRequests() {
    this.disabled = false
  }

  async fetch(
    params: Partial<ApiQueryParams | Filters>,
    options?: { cancelGroup?: string; signal?: AbortSignal }
  ) {
    if (this.disabled) return Promise.reject('disabled')

    let signal = options?.signal

    if (options?.cancelGroup) {
      const prevController = this.abortControllers.get(options.cancelGroup)
      if (prevController) {
        prevController.abort('cancelled')
      }
      const newController = new AbortController()
      this.abortControllers.set(options.cancelGroup, newController)
      signal = newController.signal
    } else if (!signal) {
      this.abortController = new AbortController()
      signal = this.abortController.signal
    }

    let response
    try {
      response = await APISearch.fetch(
        { ...processParams(params) },
        { signal }
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return Promise.reject(error)
    }
    // everything is fine but the current user interaction
    // disabled fetches AFTER we started this request
    return this.disabled ? Promise.reject('disabled') : response
  }

  async fetchListings(params: any) {
    return this.fetch({
      ...params,
      ...getDefaultRectangle(),
      ...getListingFields()
    })
  }

  async fetchBoundsForArea(query: string) {
    const { aggregates } = await APISearch.fetchClusterWithBBox({
      search: query,
      status: 'A'
    })
    // get bounds and center point of the area from API
    const { bounds, location } = aggregates?.map?.clusters?.[0] || {}

    const { map } = MapService
    if (map && bounds && location) {
      const areaZoom = calcZoomLevel(map, bounds)

      // NOTE: object' bounds are too big to be the real area,
      // lets fallback to its center point with the default zoom level for areas
      if (areaZoom < fallbackAreaZoom) {
        const fallbackBounds = calcBoundsAtZoom(map, location, defaultAreaZoom)
        return fallbackBounds
      }
    }

    return bounds
  }

  async fetchBoundsForAddress(query: string): Promise<ApiBounds | undefined> {
    const { map } = MapService
    if (!map) return undefined

    const address = await MapSearch.fetchMapboxSuggestion(query)
    const point = address
      ? await MapSearch.fetchMapboxAddressPoint(address)
      : undefined

    return point && map
      ? calcBoundsAtZoom(map, point, defaultAddressZoom)
      : undefined
  }
}

const searchServiceInstance = new SearchService()
export default searchServiceInstance
